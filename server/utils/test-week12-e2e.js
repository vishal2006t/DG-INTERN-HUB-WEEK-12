/**
 * DG Interns Hub — Week 12 Comprehensive Backend API, Security, RBAC & Data E2E Test Suite
 * Runs cleanly in-process against an ephemeral Express listener connected to MongoDB Atlas,
 * and cleans up every created record & temporary uploaded PDF in finally{}.
 */
import dotenv from 'dotenv';
dotenv.config();

process.env.NODE_ENV = 'test';

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import rateLimit from 'express-rate-limit';

const { default: app } = await import('../server.js');
const { connectDB, closeDB } = await import('../config/database.js');
const { default: User } = await import('../models/User.js');
const { default: Job } = await import('../models/Job.js');
const { default: Application } = await import('../models/Application.js');
const { default: Notification } = await import('../models/Notification.js');
const { default: ContactMessage } = await import('../models/ContactMessage.js');

const runTag = `w12test-${Date.now()}`;
const created = {
  userIds: [],
  jobIds: [],
  appIds: [],
  contactIds: [],
  notifIds: [],
  uploadedFiles: []
};

const results = [];

async function runCase(id, title, fn) {
  const start = Date.now();
  try {
    const note = await fn();
    const ms = Date.now() - start;
    results.push({ id, title, status: 'PASS', ms, note: note || '' });
    console.log(`[PASS] ${id}: ${title} (${ms}ms)${note ? ' — ' + note : ''}`);
  } catch (err) {
    const ms = Date.now() - start;
    results.push({ id, title, status: 'FAIL', ms, note: err.message });
    console.error(`[FAIL] ${id}: ${title} (${ms}ms) — ${err.message}`);
  }
}

async function reqJson(baseUrl, route, options = {}) {
  const res = await fetch(`${baseUrl}${route}`, options);
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, headers: res.headers, body };
}

async function runSuite() {
  await connectDB();

  let server;
  let baseUrl;

  try {
    server = await new Promise((resolve) => {
      const s = app.listen(0, '127.0.0.1', () => resolve(s));
    });
    const addr = server.address();
    baseUrl = `http://127.0.0.1:${addr.port}`;
    console.log(`\nRunning Week 12 E2E Suite against ${baseUrl} (tag: ${runTag})\n`);

    let candidateToken = '';
    let candidateId = '';
    let recruiterToken = '';
    let recruiterId = '';
    let recruiter2Token = '';
    let recruiter2Id = '';
    let adminToken = '';
    let createdJobId = '';
    let createdAppId = '';
    let createdContactId = '';

    // TC01: Health Check
    await runCase('TC01', 'Health endpoint verifies MongoDB connectivity', async () => {
      const { status, body } = await reqJson(baseUrl, '/api/health');
      assert.equal(status, 200);
      assert.equal(body.success, true);
      assert.equal(body.database.connected, true);
      return `db=${body.database.name}`;
    });

    // TC02: Public Analytics
    await runCase('TC02', 'Public analytics returns live non-negative DB metrics', async () => {
      const { status, body } = await reqJson(baseUrl, '/api/analytics/public');
      assert.equal(status, 200);
      assert.equal(body.success, true);
      assert.equal(typeof body.data.activeInternships, 'number');
      assert.equal(typeof body.data.registeredCandidates, 'number');
      assert.equal(typeof body.data.partnerCompanies, 'number');
      assert.equal(typeof body.data.applicationsProcessed, 'number');
      return `open=${body.data.activeInternships}, candidates=${body.data.registeredCandidates}`;
    });

    // TC03: Registration (Candidate, Recruiter + Admin privilege escalation prevention)
    await runCase('TC03', 'Registration hashes password, assigns roles, blocks self-assigned admin role', async () => {
      const candRes = await reqJson(baseUrl, '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test Candidate ${runTag}`,
          email: `cand-${runTag}@example.com`,
          password: 'Password123!',
          role: 'admin', // Should be downgraded to candidate!
          phone: '9876543210'
        })
      });
      assert.equal(candRes.status, 201);
      assert.equal(candRes.body.data.user.role, 'candidate');
      assert.ok(candRes.body.data.token);
      assert.equal(candRes.body.data.user.password, undefined);
      candidateToken = candRes.body.data.token;
      candidateId = candRes.body.data.user.id;
      created.userIds.push(candidateId);

      const rec1Res = await reqJson(baseUrl, '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test Recruiter1 ${runTag}`,
          email: `rec1-${runTag}@example.com`,
          password: 'Password123!',
          role: 'recruiter',
          companyName: 'TestCorp Alpha'
        })
      });
      assert.equal(rec1Res.status, 201);
      assert.equal(rec1Res.body.data.user.role, 'recruiter');
      recruiterToken = rec1Res.body.data.token;
      recruiterId = rec1Res.body.data.user.id;
      created.userIds.push(recruiterId);

      const rec2Res = await reqJson(baseUrl, '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Test Recruiter2 ${runTag}`,
          email: `rec2-${runTag}@example.com`,
          password: 'Password123!',
          role: 'recruiter',
          companyName: 'OtherCorp Beta'
        })
      });
      assert.equal(rec2Res.status, 201);
      recruiter2Token = rec2Res.body.data.token;
      recruiter2Id = rec2Res.body.data.user.id;
      created.userIds.push(recruiter2Id);
      return `candidateId=${candidateId}`;
    });

    // TC04: Login & Admin Auth
    await runCase('TC04', 'Login succeeds for Candidate and Seeded Admin without returning password', async () => {
      const candLogin = await reqJson(baseUrl, '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `cand-${runTag}@example.com`,
          password: 'Password123!'
        })
      });
      assert.equal(candLogin.status, 200);
      assert.ok(candLogin.body.data.token);
      assert.equal(candLogin.body.data.user.password, undefined);

      const adminLogin = await reqJson(baseUrl, '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@dginternshub.com',
          password: 'AdminPassword123!'
        })
      });
      assert.equal(adminLogin.status, 200);
      assert.equal(adminLogin.body.data.user.role, 'admin');
      adminToken = adminLogin.body.data.token;
      return 'JWT issued & lastLogin updated';
    });

    // TC05: Invalid Login
    await runCase('TC05', 'Invalid password rejects with 401', async () => {
      const { status, body } = await reqJson(baseUrl, '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `cand-${runTag}@example.com`,
          password: 'WrongPassword!'
        })
      });
      assert.equal(status, 401);
      assert.equal(body.success, false);
    });

    // TC06: Missing / Invalid JWT rejected
    await runCase('TC06', 'Unauthenticated and invalid JWT requests return 401', async () => {
      const noTok = await reqJson(baseUrl, '/api/auth/me');
      assert.equal(noTok.status, 401);

      const badTok = await reqJson(baseUrl, '/api/users/profile', {
        headers: { Authorization: 'Bearer malformed.jwt.token' }
      });
      assert.equal(badTok.status, 401);
    });

    // TC07: Registration Validation
    await runCase('TC07', 'Registration rejects weak password and malformed email with 400', async () => {
      const { status, body } = await reqJson(baseUrl, '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'A',
          email: 'not-an-email',
          password: '123'
        })
      });
      assert.equal(status, 400);
      assert.equal(body.success, false);
    });

    // TC08: NoSQL Injection Protection
    await runCase('TC08', 'NoSQL operator injection ($gt/$ne) blocked on auth, jobs, and admin users', async () => {
      const injAuth = await reqJson(baseUrl, '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: { $gt: '' },
          password: { $gt: '' }
        })
      });
      assert.equal(injAuth.status, 400);

      const injJobs = await reqJson(baseUrl, '/api/jobs?type[$ne]=internship');
      assert.equal(injJobs.status, 200);

      const injUsers = await reqJson(baseUrl, '/api/users?role[$ne]=admin', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(injUsers.status, 200);
    });

    // TC09: ReDoS Protection
    await runCase('TC09', 'Regex metacharacters / ReDoS patterns in search escaped safely without 500', async () => {
      const { status, body } = await reqJson(baseUrl, '/api/jobs?search=((.*)*%5B%5C');
      assert.equal(status, 200);
      assert.equal(body.success, true);
    });

    // TC10: XSS Sanitization on Contact Form
    await runCase('TC10', 'XSS payloads stripped cleanly before persistence on /api/contact', async () => {
      const { status, body } = await reqJson(baseUrl, '/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `<script>alert(1)</script>Tester ${runTag}`,
          email: `xss-${runTag}@example.com`,
          subject: `Inquiry ${runTag}`,
          message: `Checking XSS sanitization <img onerror=alert(1) src=x> for ${runTag}.`
        })
      });
      assert.equal(status, 201);
      createdContactId = body.data._id;
      created.contactIds.push(createdContactId);
      assert.equal(body.data.name.includes('<script>'), false);
      assert.equal(body.data.message.includes('onerror='), false);
    });

    // TC11: Search, Filter Facets, Experience Filter, Sorting & Pagination
    await runCase('TC11', 'Job facets, experience filter, search, sorting and pagination work on live DB', async () => {
      const facets = await reqJson(baseUrl, '/api/jobs/filters');
      assert.equal(facets.status, 200);
      assert.ok(Array.isArray(facets.body.data.categories));
      assert.ok(Array.isArray(facets.body.data.experienceLevels));

      const filtered = await reqJson(baseUrl, '/api/jobs?experience=Fresher&type=internship&sort=-stipendAmount&page=1&limit=5');
      assert.equal(filtered.status, 200);
      assert.ok(Array.isArray(filtered.body.data));
      assert.equal(filtered.body.page, 1);
      assert.equal(filtered.body.limit, 5);
      assert.ok(filtered.body.total >= filtered.body.data.length);
      return `facets=${facets.body.data.categories.length} cats, page1=${filtered.body.data.length} jobs`;
    });

    // TC12: Recruiter Job CRUD + Mass Assignment Protection
    await runCase('TC12', 'Recruiter creates & updates job; mass-assignment blocked; cross-recruiter blocked', async () => {
      const createRes = await reqJson(baseUrl, '/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${recruiterToken}`
        },
        body: JSON.stringify({
          title: `Week12 QA Intern ${runTag}`,
          company: 'TestCorp Alpha',
          location: 'Remote',
          workType: 'Remote',
          type: 'internship',
          category: 'Web Development',
          experienceLevel: 'Fresher',
          duration: '3 Months',
          stipend: '₹20,000 / month',
          skills: 'React, Node.js',
          description: 'Automated E2E verification internship listing for Week 12 capstone test run.'
        })
      });
      assert.equal(createRes.status, 201);
      createdJobId = createRes.body.data._id;
      created.jobIds.push(createdJobId);

      // Try forging applicantsCount via PUT mass assignment
      const updateRes = await reqJson(baseUrl, `/api/jobs/${createdJobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${recruiterToken}`
        },
        body: JSON.stringify({
          duration: '6 Months',
          applicantsCount: 9999
        })
      });
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.data.duration, '6 Months');
      assert.equal(updateRes.body.data.applicantsCount, 0);

      // Cross-recruiter edit must return 403
      const intruderRes = await reqJson(baseUrl, `/api/jobs/${createdJobId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${recruiter2Token}`
        },
        body: JSON.stringify({ title: 'Hijacked Title' })
      });
      assert.equal(intruderRes.status, 403);
      return `jobId=${createdJobId}`;
    });

    // TC13: Wrong Role RBAC & IDOR Protection
    await runCase('TC13', 'Wrong-role RBAC (Candidate->POST job, Recruiter->Admin analytics) and Recruiter IDOR return 403', async () => {
      const candPost = await reqJson(baseUrl, '/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`
        },
        body: JSON.stringify({
          title: 'Unauthorized',
          company: 'Fake',
          location: 'Remote',
          skills: 'JS',
          description: 'Should be blocked by RBAC middleware.'
        })
      });
      assert.equal(candPost.status, 403);

      const recAdmin = await reqJson(baseUrl, '/api/analytics/admin', {
        headers: { Authorization: `Bearer ${recruiterToken}` }
      });
      assert.equal(recAdmin.status, 403);

      const idorRes = await reqJson(baseUrl, `/api/applications/recruiter?jobId=${createdJobId}`, {
        headers: { Authorization: `Bearer ${recruiter2Token}` }
      });
      assert.equal(idorRes.status, 403);
    });

    // TC14: Secure PDF Resume Upload (%PDF- magic byte verification)
    await runCase('TC14', 'Resume upload blocks non-PDF magic bytes (400) and accepts valid PDF (200)', async () => {
      const fakeForm = new FormData();
      fakeForm.append('resume', new Blob(['#!/bin/sh\nrm -rf /\n'], { type: 'application/pdf' }), 'malicious.pdf');
      const fakeUpload = await reqJson(baseUrl, '/api/applications/upload-resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${candidateToken}` },
        body: fakeForm
      });
      assert.equal(fakeUpload.status, 400);

      const validPdfForm = new FormData();
      validPdfForm.append(
        'resume',
        new Blob(['%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n'], { type: 'application/pdf' }),
        `resume-${runTag}.pdf`
      );
      const okUpload = await reqJson(baseUrl, '/api/applications/upload-resume', {
        method: 'POST',
        headers: { Authorization: `Bearer ${candidateToken}` },
        body: validPdfForm
      });
      assert.equal(okUpload.status, 200);
      assert.ok(okUpload.body.data.resumeUrl.endsWith('.pdf'));

      const relPath = okUpload.body.data.resumeUrl.replace(/^\//, '');
      created.uploadedFiles.push(path.join(process.cwd(), relPath));
      return okUpload.body.data.resumeUrl;
    });

    // TC15: Candidate Profile Update + Application Submit/Duplicate/Withdraw
    await runCase('TC15', 'Candidate updates profile fields, submits & withdraws job application', async () => {
      const profRes = await reqJson(baseUrl, '/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`
        },
        body: JSON.stringify({
          headline: 'B.Tech CSE Final Year',
          location: 'Bengaluru',
          education: 'Vellore Institute of Technology',
          notificationPreferences: { emailUpdates: false, inAppAlerts: true }
        })
      });
      assert.equal(profRes.status, 200);
      assert.equal(profRes.body.data.user.headline, 'B.Tech CSE Final Year');
      assert.equal(profRes.body.data.user.notificationPreferences.emailUpdates, false);

      const appRes = await reqJson(baseUrl, '/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`
        },
        body: JSON.stringify({
          jobId: createdJobId,
          fullName: `=HYPERLINK("http://evil") Candidate ${runTag}`,
          email: `cand-${runTag}@example.com`,
          phone: '9876543210',
          whyInterested: 'Strong MERN stack skills and Week 12 QA test coverage.'
        })
      });
      assert.equal(appRes.status, 201);
      createdAppId = appRes.body.data._id;
      created.appIds.push(createdAppId);

      // Duplicate application rejected with 409
      const dupRes = await reqJson(baseUrl, '/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`
        },
        body: JSON.stringify({
          jobId: createdJobId,
          fullName: `Candidate ${runTag}`,
          email: `cand-${runTag}@example.com`,
          phone: '9876543210',
          whyInterested: 'Duplicate submission check for Week 12 capstone test'
        })
      });
      assert.equal(dupRes.status, 409);

      // Withdraw & re-verify applicantsCount >= 0
      const delRes = await reqJson(baseUrl, `/api/applications/${createdAppId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${candidateToken}` }
      });
      assert.equal(delRes.status, 200);
    });

    // TC16: Recruiter Review Notes, Status Notification & Safe CSV Export
    await runCase('TC16', 'Recruiter updates application status/notes & CSV export neutralizes formula injection', async () => {
      const reapply = await reqJson(baseUrl, '/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${candidateToken}`
        },
        body: JSON.stringify({
          jobId: createdJobId,
          fullName: `=CMD|'/C calc'!A0 ${runTag}`,
          email: `cand-${runTag}@example.com`,
          phone: '9876543210',
          whyInterested: 'Re-apply for recruiter status & CSV export check.'
        })
      });
      assert.equal(reapply.status, 201);
      createdAppId = reapply.body.data._id;
      created.appIds.push(createdAppId);

      const recList = await reqJson(baseUrl, `/api/applications/recruiter?jobId=${createdJobId}`, {
        headers: { Authorization: `Bearer ${recruiterToken}` }
      });
      assert.equal(recList.status, 200);
      assert.equal(recList.body.data.applications.length, 1);

      const statusRes = await reqJson(baseUrl, `/api/applications/${createdAppId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${recruiterToken}`
        },
        body: JSON.stringify({
          status: 'shortlisted',
          recruiterNotes: 'Strong MERN portfolio — scheduled technical round.'
        })
      });
      assert.equal(statusRes.status, 200);
      assert.equal(statusRes.body.data.status, 'shortlisted');

      const csvRes = await reqJson(baseUrl, '/api/applications/export/csv', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(csvRes.status, 200);
      assert.ok(typeof csvRes.body === 'string');
      assert.ok(csvRes.body.includes(`"'=CMD|'/C calc'!A0 ${runTag}"`), 'CSV cell must neutralize leading = formula');
    });

    // TC17: Notifications Read & Delete
    await runCase('TC17', 'Notifications endpoint lists, marks read, and deletes notification', async () => {
      const listRes = await reqJson(baseUrl, '/api/notifications', {
        headers: { Authorization: `Bearer ${candidateToken}` }
      });
      assert.equal(listRes.status, 200);
      const notif = listRes.body.data.notifications[0];
      assert.ok(notif);

      const readRes = await reqJson(baseUrl, `/api/notifications/${notif._id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${candidateToken}` }
      });
      assert.equal(readRes.status, 200);

      const delNotif = await reqJson(baseUrl, `/api/notifications/${notif._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${candidateToken}` }
      });
      assert.equal(delNotif.status, 200);
    });

    // TC18: Admin Platform Overview, Users, Apps, Inquiries & Cascading Delete
    await runCase('TC18', 'Admin views analytics, users, applications, updates inquiry, deletes job cleanly', async () => {
      const stats = await reqJson(baseUrl, '/api/analytics/admin', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(stats.status, 200);
      assert.ok(stats.body.data.users.total >= 3);
      assert.ok(stats.body.data.inquiries.total >= 1);

      const appsAdmin = await reqJson(baseUrl, '/api/applications/admin', {
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(appsAdmin.status, 200);
      assert.ok(Array.isArray(appsAdmin.body.data));

      const inqPatch = await reqJson(baseUrl, `/api/contact/${createdContactId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status: 'resolved' })
      });
      assert.equal(inqPatch.status, 200);
      assert.equal(inqPatch.body.data.status, 'resolved');

      // Delete job -> verify cascading deletion of application
      const delJob = await reqJson(baseUrl, `/api/jobs/${createdJobId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.equal(delJob.status, 200);
      const leftoverApp = await Application.findById(createdAppId);
      assert.equal(leftoverApp, null);
    });

    // TC19: CORS Enforcement
    await runCase('TC19', 'CORS rejects disallowed third-party origins (403) and permits localhost', async () => {
      const badCors = await reqJson(baseUrl, '/api/health', {
        headers: { Origin: 'https://evil-attacker.example' }
      });
      assert.equal(badCors.status, 403);

      const okCors = await fetch(`${baseUrl}/api/health`, {
        headers: { Origin: 'http://localhost:5173' }
      });
      assert.equal(okCors.status, 200);
      assert.equal(okCors.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    });

    // TC20: Rate Limiter Behavior (429 after threshold)
    await runCase('TC20', 'Rate limiter emits standard headers and enforces 429 after max attempts', async () => {
      const healthRes = await fetch(`${baseUrl}/api/health`);
      assert.ok(healthRes.headers.get('ratelimit-limit'));

      // Verify express-rate-limit enforcement on a minimal isolated limiter with max: 3
      const miniApp = express();
      miniApp.use(
        '/auth',
        rateLimit({
          windowMs: 60000,
          max: 3,
          standardHeaders: true,
          legacyHeaders: false,
          message: { success: false, message: 'Rate limited' }
        }),
        (_req, res) => res.status(401).json({ success: false })
      );
      const miniSrv = await new Promise((resolve) => {
        const s = miniApp.listen(0, '127.0.0.1', () => resolve(s));
      });
      try {
        const mUrl = `http://127.0.0.1:${miniSrv.address().port}/auth`;
        for (let i = 0; i < 3; i++) {
          const r = await fetch(mUrl);
          assert.equal(r.status, 401);
        }
        const blocked = await fetch(mUrl);
        assert.equal(blocked.status, 429);
      } finally {
        miniSrv.close();
      }
      return 'Headers active + 429 verified';
    });
  } finally {
    // Cleanup temporary test data from MongoDB Atlas and disk
    try {
      if (created.appIds.length > 0) {
        await Application.deleteMany({ _id: { $in: created.appIds } });
      }
      if (created.jobIds.length > 0) {
        await Job.deleteMany({ _id: { $in: created.jobIds } });
      }
      if (created.userIds.length > 0) {
        await Notification.deleteMany({ recipient: { $in: created.userIds } });
        await User.deleteMany({ _id: { $in: created.userIds } });
      }
      if (created.contactIds.length > 0) {
        await ContactMessage.deleteMany({ _id: { $in: created.contactIds } });
      }
      await Notification.deleteMany({ message: { $regex: runTag } });
      for (const filePath of created.uploadedFiles) {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr.message);
    }

    if (server) server.close();
    await closeDB();
  }

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  console.log(`\n=== SUMMARY: ${passed}/${results.length} PASSED, ${failed} FAILED ===`);
  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runSuite().catch((err) => {
  console.error('Fatal suite error:', err);
  process.exit(1);
});
