import User from '../models/User.js';
import Job from '../models/Job.js';

export const seedInitialData = async () => {
  try {
    const userCount = await User.countDocuments();
    let adminUser, recruiterUser, candidateUser;

    if (userCount === 0) {
      console.log('[Seeder] Seeding default accounts (Admin, Recruiter, Candidate)...');

      adminUser = await User.create({
        name: 'DG Hub Administrator',
        email: 'admin@dginternshub.com',
        password: 'AdminPassword123!',
        role: 'admin',
        phone: '+91 98765 43210',
        bio: 'DG Interns Hub Platform Administrator'
      });

      recruiterUser = await User.create({
        name: 'Sarah Jenkins',
        email: 'recruiter@nexoracloud.com',
        password: 'RecruiterPassword123!',
        role: 'recruiter',
        companyName: 'Nexora Cloud Solutions',
        phone: '+91 98765 12345',
        bio: 'Technical Talent Acquisition Lead at Nexora Cloud'
      });

      candidateUser = await User.create({
        name: 'Alex Johnson',
        email: 'candidate@example.com',
        password: 'CandidatePassword123!',
        role: 'candidate',
        phone: '+91 98765 67890',
        bio: 'Computer Science sophomore passionate about Full Stack Development',
        skills: ['React', 'Node.js', 'JavaScript', 'MongoDB', 'CSS']
      });

      console.log(`[Seeder] Default accounts created: Admin (${adminUser.email}), Recruiter (${recruiterUser.email}), Candidate (${candidateUser.email})`);
    } else {
      adminUser = await User.findOne({ role: 'admin' });
      recruiterUser = await User.findOne({ role: 'recruiter' });
    }

    const jobCount = await Job.countDocuments();
    if (jobCount === 0 && (recruiterUser || adminUser)) {
      console.log('[Seeder] Seeding Week 7 initial job opportunities...');
      const posterId = (recruiterUser || adminUser)._id;

      const initialJobs = [
        {
          title: 'Web Development Intern',
          company: 'Nexora Cloud Solutions',
          location: 'Remote (India)',
          workType: 'Remote',
          type: 'internship',
          duration: '3 Months',
          stipend: '₹18,000 / month',
          stipendAmount: 18000,
          category: 'Web Development',
          applicantsCount: 64,
          openings: 3,
          featured: true,
          skills: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Git', 'REST APIs'],
          description: 'Build modern, accessible web interfaces and collaborate with senior engineers to deliver scalable client portals and landing pages.',
          shortDescription: 'Build modern, accessible web interfaces and collaborate with senior engineers to deliver scalable client portals and landing pages.',
          about: 'Nexora Cloud Solutions is a fast-growing cloud enterprise consultancy helping startups modernize their digital presence. You will work on real-world client dashboards, component libraries, and interactive marketing pages.',
          responsibilities: [
            'Develop responsive and cross-browser compatible web pages using HTML5, CSS3, and modern JavaScript (ES6+).',
            'Collaborate with UI/UX designers to translate Figma wireframes into pixel-perfect, accessible code.',
            'Integrate backend RESTful APIs and handle asynchronous data workflows cleanly.',
            'Participate in daily agile standups, sprint reviews, and peer code reviews.'
          ],
          requirements: [
            'Solid understanding of HTML5, CSS3, Flexbox, CSS Grid, and vanilla JavaScript.',
            'Familiarity with version control using Git and GitHub workflows.',
            'Basic understanding of asynchronous programming (Promises, async/await, Fetch API).'
          ],
          whoCanApply: [
            'Currently pursuing B.Tech / B.E. / BCA / MCA / B.Sc in Computer Science or related disciplines.',
            'Available for a minimum duration of 3 consecutive months.'
          ],
          learning: [
            'Real-world enterprise frontend architecture and component design principles.',
            'Performance optimization techniques including lazy loading, asset compression, and Core Web Vitals.'
          ],
          benefits: [
            'Guaranteed monthly stipend of ₹18,000.',
            'Verified Certificate of Internship Completion.',
            'Flexible 5-day work week.'
          ],
          slug: 'web-development-intern',
          postedBy: posterId
        },
        {
          title: 'Frontend React Intern',
          company: 'PixelCraft Digital Labs',
          location: 'Remote (Global)',
          workType: 'Remote',
          type: 'internship',
          duration: '4 Months',
          stipend: '₹22,000 / month',
          stipendAmount: 22000,
          category: 'Web Development',
          applicantsCount: 88,
          openings: 2,
          featured: true,
          skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux Toolkit', 'REST APIs'],
          description: 'Create production-ready web applications using React, Next.js, and modern CSS frameworks with modular components.',
          shortDescription: 'Create production-ready web applications using React, Next.js, and modern CSS frameworks with modular components.',
          about: 'PixelCraft is an award-winning digital design and engineering agency creating high-impact consumer web products and SaaS experiences.',
          responsibilities: [
            'Develop reusable, testable React functional components with modern Hooks.',
            'Implement client-side state management and integrate backend REST endpoints.',
            'Ensure pixel-perfect fidelity with design systems and responsive layouts.'
          ],
          requirements: [
            'Proficiency in React 18/19, JSX, and ES6+ JavaScript.',
            'Experience consuming REST APIs with fetch or Axios.',
            'Familiarity with Tailwind CSS or CSS Modules.'
          ],
          whoCanApply: [
            'College students or recent graduates with strong frontend portfolio projects.',
            'Able to commit 30-35 hours per week remotely.'
          ],
          learning: [
            'Production React state patterns, performance memoization, and custom hooks.',
            'CI/CD deployment pipelines using Vercel and GitHub Actions.'
          ],
          benefits: [
            'Competitive monthly stipend of ₹22,000.',
            'Pre-Placement Offer (PPO) opportunity for top performers.',
            'Direct 1:1 mentorship from Staff Frontend Architects.'
          ],
          slug: 'frontend-react-intern',
          postedBy: posterId
        },
        {
          title: 'Python & AI Engineering Intern',
          company: 'AetherMind Intelligence',
          location: 'Bengaluru / Hybrid',
          workType: 'Hybrid',
          type: 'internship',
          duration: '6 Months',
          stipend: '₹25,000 / month',
          stipendAmount: 25000,
          category: 'Python & AI',
          applicantsCount: 112,
          openings: 4,
          featured: true,
          skills: ['Python', 'FastAPI', 'PyTorch', 'LangChain', 'OpenAI API', 'Docker', 'PostgreSQL'],
          description: 'Contribute to building generative AI microservices, prompt chains, and automated data pipelines using cutting-edge open-source LLMs.',
          shortDescription: 'Contribute to building generative AI microservices, prompt chains, and automated data pipelines using cutting-edge open-source LLMs.',
          about: 'AetherMind Intelligence builds enterprise AI agents and document intelligence systems for Fortune 500 financial institutions.',
          responsibilities: [
            'Build and optimize retrieval-augmented generation (RAG) pipelines using LangChain and vector databases.',
            'Develop asynchronous backend microservices in Python with FastAPI.',
            'Evaluate LLM response accuracy and fine-tune prompt strategies.'
          ],
          requirements: [
            'Strong foundation in Python programming, data structures, and algorithms.',
            'Hands-on exposure to Machine Learning concepts or Generative AI APIs.',
            'Basic experience with SQL/PostgreSQL and containerization with Docker.'
          ],
          whoCanApply: [
            'Pre-final or final year engineering students with AI/ML coursework.',
            'Available for hybrid work in Bengaluru office 2 days per week.'
          ],
          learning: [
            'Industrial LLMOps, semantic vector search, and model evaluation benchmarks.',
            'High-throughput asynchronous Python architecture and cloud deployments.'
          ],
          benefits: [
            'Industry-leading stipend of ₹25,000 / month.',
            'Letter of Recommendation & potential full-time conversion.',
            'Free meals, learning stipends, and GPU cloud compute credits.'
          ],
          slug: 'python-ai-intern',
          postedBy: posterId
        },
        {
          title: 'Full Stack MERN Intern',
          company: 'CloudSphere Technologies',
          location: 'Remote (India)',
          workType: 'Remote',
          type: 'internship',
          duration: '3 Months',
          stipend: '₹20,000 / month',
          stipendAmount: 20000,
          category: 'Full Stack Development',
          applicantsCount: 76,
          openings: 2,
          featured: true,
          skills: ['MongoDB', 'Express.js', 'React', 'Node.js', 'JWT', 'REST APIs', 'Postman'],
          description: 'Build full-stack web applications from database schemas to polished React user interfaces with complete CRUD and authentication.',
          shortDescription: 'Build full-stack web applications from database schemas to polished React user interfaces with complete CRUD and authentication.',
          about: 'CloudSphere Technologies provides scalable B2B cloud SaaS tools for operations management.',
          responsibilities: [
            'Design MongoDB schemas and implement REST APIs with Express and Mongoose.',
            'Build responsive React user interfaces and connect with backend services.',
            'Implement secure JWT authentication and role-based permissions.'
          ],
          requirements: [
            'Working knowledge of JavaScript/Node.js, Express, React, and MongoDB.',
            'Understanding of REST API design principles and HTTP status codes.',
            'Familiarity with Postman for testing endpoints.'
          ],
          whoCanApply: [
            'Students or self-taught developers with full-stack MERN portfolio projects.'
          ],
          learning: [
            'Clean backend architecture, database indexing, and secure token workflows.',
            'Production deployment on cloud services.'
          ],
          benefits: [
            'Guaranteed monthly stipend of ₹20,000.',
            'Mentorship from Senior Full Stack Engineers.'
          ],
          slug: 'fullstack-mern-intern',
          postedBy: posterId
        },
        {
          title: 'UI/UX Design & Prototyping Intern',
          company: 'Kroma Studio',
          location: 'Remote (India)',
          workType: 'Remote',
          type: 'internship',
          duration: '3 Months',
          stipend: '₹16,000 / month',
          stipendAmount: 16000,
          category: 'UI/UX Design',
          applicantsCount: 45,
          openings: 2,
          featured: false,
          skills: ['Figma', 'Wireframing', 'Prototyping', 'User Research', 'Design Systems'],
          description: 'Craft intuitive wireframes, mockups, and high-fidelity prototypes for next-generation web and mobile applications.',
          shortDescription: 'Craft intuitive wireframes, mockups, and high-fidelity prototypes for next-generation web and mobile applications.',
          about: 'Kroma Studio is a product design consultancy helping startups build frictionless user experiences.',
          responsibilities: [
            'Create low and high fidelity wireframes in Figma.',
            'Maintain and expand design systems and token libraries.',
            'Collaborate with developers to ensure design integrity.'
          ],
          requirements: [
            'Strong Figma skills and understanding of typography, color theory, and layout.',
            'A design portfolio demonstrating web or mobile UI/UX work.'
          ],
          whoCanApply: ['Design students or freshers with active Figma portfolios.'],
          learning: ['Enterprise design systems, interactive component variants, and handoff workflows.'],
          benefits: ['₹16,000 / month stipend, portfolio review sessions.'],
          slug: 'ui-ux-design-intern',
          postedBy: posterId
        },
        {
          title: 'Data Science & Analytics Intern',
          company: 'Vantage Data Labs',
          location: 'Hyderabad / Hybrid',
          workType: 'Hybrid',
          type: 'internship',
          duration: '4 Months',
          stipend: '₹21,000 / month',
          stipendAmount: 21000,
          category: 'Data Science & Analytics',
          applicantsCount: 52,
          openings: 2,
          featured: false,
          skills: ['Python', 'Pandas', 'SQL', 'Tableau', 'Power BI', 'Statistics'],
          description: 'Analyze real-world business datasets, create interactive dashboards, and generate actionable predictive insights.',
          shortDescription: 'Analyze real-world business datasets, create interactive dashboards, and generate actionable predictive insights.',
          about: 'Vantage Data Labs delivers advanced business intelligence and machine learning analytics to retail leaders.',
          responsibilities: [
            'Extract, clean, and transform structured data from SQL databases.',
            'Build automated reporting dashboards in Tableau and Power BI.',
            'Perform exploratory data analysis and hypothesis testing.'
          ],
          requirements: [
            'Strong SQL and Python (Pandas, NumPy) skills.',
            'Understanding of statistics and data visualization principles.'
          ],
          whoCanApply: ['Students in Data Science, Statistics, Mathematics, or CS.'],
          learning: ['Business intelligence pipelines and scalable data transformation.'],
          benefits: ['₹21,000 monthly stipend, real-world case studies.'],
          slug: 'data-science-intern',
          postedBy: posterId
        }
      ];

      await Job.insertMany(initialJobs);
      console.log(`[Seeder] Seeded ${initialJobs.length} verified jobs into database.`);
    }

    // Backfill experienceLevel for legacy jobs missing this field
    await Job.updateMany(
      { $or: [{ experienceLevel: { $exists: false } }, { experienceLevel: null }, { experienceLevel: '' }] },
      { $set: { experienceLevel: 'Fresher' } }
    );
  } catch (error) {
    console.error('[Seeder] Error seeding database:', error.message);
  }
};
