interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'Personal Portfolio Website',
    description: `A modern, responsive portfolio website built with Next.js, Tailwind CSS, and TypeScript. 
    Features include a blog, project showcase, contact form, and dark mode support. 
    Optimized for performance and SEO.`,
    imgSrc: '/static/images/portfolio-preview.png',
    href: 'https://anuragashok.com',
  },
  {
    title: 'E-Commerce Platform',
    description: `A full-stack e-commerce solution built with React, Node.js, and MongoDB. 
    Features include user authentication, product catalog, shopping cart, payment integration, 
    and admin dashboard for inventory management.`,
    imgSrc: '/static/images/ecommerce-preview.png',
    href: '/blog/building-ecommerce-platform',
  },
  {
    title: 'Task Management App',
    description: `A collaborative task management application with real-time updates using Socket.io. 
    Built with React, Express.js, and PostgreSQL. Features include team collaboration, 
    project tracking, and deadline notifications.`,
    imgSrc: '/static/images/taskmanager-preview.png',
    href: '/blog/task-management-app',
  },
  {
    title: 'Weather Dashboard',
    description: `A responsive weather dashboard that displays current conditions and forecasts. 
    Built with React and integrates with multiple weather APIs. Features include location search, 
    favorite locations, and weather alerts.`,
    imgSrc: '/static/images/weather-preview.png',
    href: '/blog/weather-dashboard',
  },
]

export default projectsData
