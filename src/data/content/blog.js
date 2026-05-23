import { initialConfig } from 'config';

const blog = (index) => `${initialConfig.assetsDir}/images/content/details/blog/${index}.webp`;

export const moreFromCreator = [
  {
    id: 1,
    type: 'blogs',
    category: 'Architecture',
    requiredTime: '12 min read',
    title: 'Futuristic Architecture: How Cutting-Edge Designs Are Shaping Cities',
    description:
      'Explore the latest trends in futuristic architecture, from smart buildings to AI-driven urban planning, and how they’re redefining cityscapes',
    date: '2024-12-11',
    thumbnail: blog(5),
    uploadedBy: {
      name: 'Wild Planet Films',
    },
  },
  {
    id: 2,
    type: 'blogs',
    category: 'Architecture',
    requiredTime: '7 min read',
    title: 'From Sketch to Structure: The Role of Concept Art in Architectural Design',
    description:
      'Learn how concept art plays a crucial role in architectural visualization, bridging creativity and engineering to create stunning structures.',
    date: '2024-12-12',
    thumbnail: blog(6),
    uploadedBy: {
      name: 'Wild Planet Films',
    },
  },
  {
    id: 3,
    type: 'blogs',
    category: 'Concept Art',
    requiredTime: '11 min read',
    title: 'The Art Behind World-Building: How Concept Art Shapes Visual Stories',
    description:
      'Dive into the world of concept art and discover how artists craft immersive environments for films, games, and digital media.',
    date: '2024-12-23',
    thumbnail: blog(7),
    uploadedBy: {
      name: 'Wild Planet Films',
    },
  },
];

export const blogDetailsTags = [
  { id: 1, label: 'Architecture' },
  { id: 2, label: 'Modern' },
  { id: 3, label: 'Design' },
  { id: 4, label: 'Modern Architecture' },
  { id: 5, label: 'Sustainable' },
  { id: 6, label: 'Architect' },
  { id: 7, label: 'Structure' },
  { id: 8, label: 'Landmark' },
  { id: 9, label: 'Innovative Material' },
  { id: 10, label: 'Form' },
  { id: 11, label: 'Technology' },
];

export const blogRecommendations = [
  {
    id: 1,
    type: 'blogs',
    category: 'Architecture',
    requiredTime: '11 min read',
    title: 'The Future of Architecture: How Smart Cities Are Transforming Urban Living',
    description:
      'Explore how technology, AI, and sustainable design are shaping the future of urban environments. Learn how smart cities are created to optimize energy, reduce waste, and improve the quality of life for residents.',
    author: 'Alexander Quinn',
    date: '10 Dec, 2024',
    thumbnail: blog(8),
    uploadedBy: {
      name: 'Bob Borson',
    },
  },
  {
    id: 2,
    type: 'blogs',
    category: 'Concept Art',
    requiredTime: '3 min read',
    title: 'The Art of Environment Design: How Concept Artists Create Immersive Worlds',
    description:
      'Discover the techniques concept artists use to craft stunning environments for games and films. Learn about world-building, color theory, and visual storytelling to create believable and engaging settings.',
    author: 'Sophia Bennett',
    date: '10 Dec, 2024',
    thumbnail: blog(9),
    uploadedBy: {
      name: 'Syd Mead',
    },
  },
  {
    id: 3,
    type: 'blogs',
    category: 'Architecture',
    requiredTime: '20 min read',
    title: 'Revolutionizing Skylines: The Rise of Parametric Architecture',
    description:
      'Learn how computational design and algorithms are redefining modern architecture. Explore how complex, non-linear forms are now possible, creating buildings that are both aesthetically unique and structurally efficient.',
    author: 'Olivia Grant',
    date: '12 Dec, 2024',
    thumbnail: blog(10),
    uploadedBy: {
      name: 'Zaha Hadid',
    },
  },
  {
    id: 4,
    type: 'blogs',
    category: 'Concept Art',
    requiredTime: '7 min read',
    title: 'From Sketch to Masterpiece: The Creative Process Behind Concept Art',
    description:
      'A deep dive into how concept artists develop their ideas, from initial sketches and mood boards to final polished illustrations. This guide covers the essential steps to bringing a creative vision to life.',
    author: 'Kevin Blake',
    date: '14 Dec, 2024',
    thumbnail: blog(11),
    uploadedBy: {
      name: 'Ralph McQuarrie',
    },
  },
  {
    id: 5,
    type: 'blogs',
    category: 'Architecture',
    requiredTime: '10 min read',
    title: 'Adaptive Reuse: How Architects Are Breathing New Life Into Old Buildings',
    description:
      'Explore how historic buildings are being transformed into modern functions, preserving their cultural heritage while meeting contemporary needs. Learn about the sustainable and creative practice of adaptive reuse.',
    author: 'Ralph McQuarrie',
    date: '17 Dec, 2024',
    thumbnail: blog(12),
    uploadedBy: {
      name: 'Francis D.K. Ching',
    },
  },
  {
    id: 6,
    type: 'blogs',
    category: 'Architecture',
    requiredTime: '15 min read',
    title: 'Fantastic Architecture: Concepts and Dreams',
    description:
      'See how architects are pushing the boundaries of design with fantastical and imaginative concepts. From floating cities to surreal structures, these designs challenge conventional notions of space and form.',
    author: 'Syd Mead',
    date: '17 Dec, 2024',
    thumbnail: blog(13),
    uploadedBy: {
      name: 'Santiago Calatrava',
    },
  },
];

export const blogTableOfContents = [
  {
    id: 1,
    url: 'introduction',
    label: 'Introduction',
  },
  {
    id: 2,
    url: 'evolution',
    label: 'The Evolution of Architecture',
  },
  {
    id: 3,
    url: 'principle',
    label: 'Core Principles of Architecture',
  },
  {
    id: 4,
    url: 'iconic',
    label: 'Iconic Architecture Styles',
  },
  {
    id: 5,
    url: 'role-of-technology',
    label: 'The Role of Technology in Architecture',
  },
  {
    id: 6,
    url: 'future-of-architecture',
    label: 'The Future of Architecture',
  },
  {
    id: 7,
    url: 'conclusion',
    label: 'Conclusion',
  },
];
