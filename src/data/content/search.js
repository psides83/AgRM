import { initialConfig } from 'config';
import { users } from 'data/users';

const blogs = (index) => `${initialConfig.assetsDir}/images/content/search/blogs/${index}.webp`;
const podcasts = (index) =>
  `${initialConfig.assetsDir}/images/content/search/podcasts/${index}.webp`;
const videos = (index) => `${initialConfig.assetsDir}/images/content/search/videos/${index}.webp`;

export const searchItems = [
  {
    id: 1,
    type: 'blogs',
    category: 'Animal',
    requiredTime: '12 min read',
    title: 'How Conservation Efforts Are Saving Endangered Animal Species Worldwide',
    description:
      'Across the globe, thousands of species face the threat of extinction. Conservationists are working tirelessly to protect habitats, restore ecosystems, and combat poaching.',
    author: 'Dr. Olivia Carter',
    date: '2024-12-31',
    thumbnail: blogs(1),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[1].avatar,
    },
  },
  {
    id: 2,
    type: 'blogs',
    category: 'Animal Behavior',
    requiredTime: '12 min read',
    title: '10 Fascinating Animal Behaviors That Will Amaze You again',
    description:
      'Why do dolphins surf waves for fun? How do ants create complex underground cities? The animal kingdom is full of surprising and intelligent behaviors that help species survive.',
    author: 'Sophia Bennett',
    date: '2024-12-31',
    thumbnail: blogs(2),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[3].avatar,
    },
  },
  {
    id: 3,
    type: 'blogs',
    category: 'Ocean Life',
    requiredTime: '12 min read',
    title: 'Secrets of the Deep: Amazing Marine Animals of the Ocean',
    description:
      'Beneath the ocean’s surface lies a world teeming with incredible life. From glowing jellyfish to deep-sea giants, marine animals have adapted in extraordinary ways. Some can survive crushing pressures, while others use bioluminescence to hunt.',
    author: 'Emma Lewis',
    date: '2024-12-28',
    thumbnail: blogs(3),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[1].avatar,
    },
  },
  {
    id: 4,
    type: 'blogs',
    category: 'Wildlife',
    requiredTime: '12 min read',
    title: 'The World’s Most Powerful Animals and Their Hunting Techniques',
    description:
      'Lions, tigers, cheetahs, and leopards—these apex predators rule their habitats with unmatched power and agility. But their survival depends on more than just strength.',
    author: 'Ethan Cole',
    date: '2024-12-28',
    thumbnail: blogs(4),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[2].avatar,
    },
  },
  {
    id: 5,
    type: 'blogs',
    category: 'Nature',
    requiredTime: '12 min read',
    title: 'How Humans and Animals Can Coexist in a Changing World',
    description:
      'As cities expand and natural habitats shrink, encounters between humans and wildlife are becoming more common. Can we live alongside wild animals without conflict?',
    author: 'Dr. Mia Carter',
    date: '2024-12-23',
    thumbnail: blogs(5),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[1].avatar,
    },
  },
  {
    id: 6,
    type: 'blogs',
    category: 'Animal',
    requiredTime: '12 min read',
    title: 'How Birds Migrate Thousands of Miles Without Getting Lost',
    description:
      'Every year, birds travel thousands of miles across continents, braving harsh weather and predators. But how do they navigate with such precision?',
    author: 'Dr. Lisa Morgan',
    date: '2024-12-12',
    thumbnail: blogs(6),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[1].avatar,
    },
  },
  {
    id: 7,
    type: 'blogs',
    category: 'Wildlife',
    requiredTime: '12 min read',
    title: 'Meet the Rare and Mysterious Animals of the Amazon Rainforest',
    description:
      'The Amazon rainforest is home to some of the most unique and elusive animals on Earth. From the pink river dolphin to the jaguar, each creature plays a vital role in this rich ecosystem.',
    author: 'Natalie Brooks',
    date: '2024-11-27',
    thumbnail: blogs(7),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[1].avatar,
    },
  },
  {
    id: 8,
    type: 'blogs',
    category: 'Nature',
    requiredTime: '12 min read',
    title: "10 Astonishingly Bizarre Animals You've Probably Never Heard Of",
    description:
      'Nature is full of surprises! While everyone knows lions and elephants, have you ever heard of the axolotl or the star-nosed mole? These strange yet fascinating creatures have developed incredible adaptations to survive.',
    author: 'Rachel Adams',
    date: '2024-11-21',
    thumbnail: blogs(8),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[1].avatar,
    },
  },
  {
    id: 9,
    type: 'blogs',
    category: 'Photography',
    requiredTime: '12 min read',
    title: 'How to Capture Stunning Wildlife and Animal movement  Photos Like a Pro',
    description:
      'Nature is full of surprises! While everyone knows lions and elephants, have you ever heard of the axolotl or the star-nosed mole? These strange yet fascinating creatures have developed incredible adaptations to survive.',
    author: 'Kevin Blake',
    date: '2024-11-11',
    thumbnail: blogs(9),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[1].avatar,
    },
  },
  {
    id: 10,
    type: 'blogs',
    category: 'Folklore',
    requiredTime: '12 min read',
    title: 'Legends of the Wild: Animals in Myths, Folklore, and Cultures',
    description:
      'Throughout history, animals have played powerful roles in myths and legends. From the wise owl of Athena to the mighty dragons of Asia, different cultures have woven fascinating stories around creatures, real and mythical.',
    author: 'Olivia Grant',
    date: '2024-11-21',
    thumbnail: blogs(10),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[1].avatar,
    },
  },
  {
    id: 30,
    type: 'podcasts',
    category: 'SCIENCE',
    requiredTime: '10 min',
    episode: 'Episode 1111',
    title: 'Voices for Wildlife: Stories of Conservation and Hope',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'Daniel Rivers',
    date: '2024-8-1',
    thumbnail: podcasts(1),
    uploadedBy: {
      name: 'Daniel Rivers',
      avatar: users[5].avatar,
    },
  },
  {
    id: 31,
    type: 'podcasts',
    category: 'SCIENCE',
    requiredTime: '10 min',
    episode: 'Episode 1111',
    title: 'Voices for Wildlife: Stories of Conservation and Hope',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'Dr. Marcus Hale',
    date: '2024-8-1',
    thumbnail: podcasts(2),
    isPlaylist: true,
    uploadedBy: {
      name: 'Dr. Marcus Hale',
      avatar: users[5].avatar,
    },
  },
  {
    id: 32,
    type: 'podcasts',
    category: 'SCIENCE',
    requiredTime: '10 min',
    episode: 'Episode 1111',
    title: 'Beneath the Waves: Stories of Marine Life and Conservation',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'Captain Noah Reed',
    date: '2024-8-1',
    thumbnail: podcasts(3),
    uploadedBy: {
      name: 'Captain Noah Reed',
      avatar: users[6].avatar,
    },
  },
  {
    id: 33,
    type: 'podcasts',
    category: 'Science',
    requiredTime: '10 min',
    episode: 'Episode 1111',
    title: 'Predator Chronicles: The Untamed World of Big Cats',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'Alex Stone',
    date: '2024-8-1',
    thumbnail: podcasts(4),
    uploadedBy: {
      name: 'Alex Stone',
      avatar: users[7].avatar,
    },
  },
  {
    id: 34,
    type: 'podcasts',
    category: 'Science',
    requiredTime: '10 min',
    episode: 'Episode 1111',
    title: 'Feathered Journeys: Stories of Migration and Survival',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'James Holloway',
    date: '2024-8-1',
    thumbnail: podcasts(5),
    uploadedBy: {
      name: 'James Holloway',
      avatar: users[8].avatar,
    },
  },
  {
    id: 35,
    type: 'podcasts',
    category: 'Science',
    requiredTime: '10 min',
    episode: 'Episode 1111',
    title: 'Into the Wild: The Sounds and Stories of the Rainforest',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'Dr. Ben Harper',
    date: '2024-8-1',
    thumbnail: podcasts(6),
    uploadedBy: {
      name: 'Dr. Ben Harper',
      avatar: users[9].avatar,
    },
  },
  {
    id: 36,
    type: 'podcasts',
    category: 'Science',
    requiredTime: '10 min',
    episode: 'Episode 1111',
    title: 'Nature’s Oddities: Exploring the World’s Most Unique Animals',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'Tom Weston',
    date: '2024-8-1',
    thumbnail: podcasts(7),
    uploadedBy: {
      name: 'Tom Weston',
      avatar: users[10].avatar,
    },
  },
  {
    id: 37,
    type: 'podcasts',
    category: 'Science',
    requiredTime: '10 min',
    episode: 'Episode 1111',
    title: 'Wild Perspectives: The Stories Behind Iconic Animal Footage',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'Anna Roberts',
    date: '2024-8-1',
    thumbnail: podcasts(8),
    uploadedBy: {
      name: 'Anna Roberts',
      avatar: users[11].avatar,
    },
  },
  {
    id: 38,
    type: 'podcasts',
    category: 'Science',
    requiredTime: '10 min',
    episode: 'Episode 1111',
    title: 'Living with Wildlife: Finding Harmony with Nature',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'Nathan Reed',
    date: '2024-8-1',
    thumbnail: podcasts(9),
    uploadedBy: {
      name: 'Nathan Reed',
      avatar: users[12].avatar,
    },
  },
  {
    id: 39,
    type: 'podcasts',
    category: 'Science',
    requiredTime: '10 min',
    episode: 'Episode 1111',
    title: 'Animal Legends: Mythical Creatures and Their Origins',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: podcasts(10),
    uploadedBy: {
      name: 'David Sinclair',
      avatar: users[13].avatar,
    },
  },
  {
    id: 40,
    type: 'videos',
    category: 'Nature',
    requiredTime: '10:23:34',
    title: 'Inside Wildlife Rescues: Saving Animals from Extinction',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: videos(1),
    uploadedBy: {
      name: 'Wild Planet Films',
      avatar: users[9].avatar,
    },
  },
  {
    id: 41,
    type: 'videos',
    category: 'Nature',
    requiredTime: '10:23:34',
    title: 'Why Animals Behave the Way They Do: Nature’s Survival Tactics',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: videos(2),
    uploadedBy: {
      name: 'Nature’s Wonders Channel',
      avatar: users[8].avatar,
    },
  },
  {
    id: 42,
    type: 'videos',
    category: 'Nature',
    requiredTime: '10:23:34',
    title: 'Exploring the Ocean’s Most Mysterious and Rare Creatures',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: videos(3),
    uploadedBy: {
      name: 'Blue Abyss Explorers',
      avatar: users[3].avatar,
    },
  },
  {
    id: 43,
    type: 'videos',
    category: 'Nature',
    requiredTime: '1000 eps',
    title: 'Big Cats in Action: How Lions, Tigers, and Leopards Rule the Wild',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: videos(4),
    isPlaylist: true,
    uploadedBy: {
      name: 'Predator Chronicles TV',
      avatar: users[13].avatar,
    },
  },
  {
    id: 44,
    type: 'videos',
    category: 'Nature',
    requiredTime: '1000 eps',
    title: 'The Science Behind Bird Flight and Incredible Aerial Feats',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: videos(5),
    isPlaylist: true,
    uploadedBy: {
      name: 'Feathered Explorers',
      avatar: users[14].avatar,
    },
  },
  {
    id: 45,
    type: 'videos',
    category: 'Nature',
    requiredTime: '10:23:34',
    title: 'Jungle Giants: The Largest and Smallest Animals of the Rainforest',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: videos(6),
    uploadedBy: {
      name: 'Amazon Untamed',
      avatar: users[1].avatar,
    },
  },
  {
    id: 46,
    type: 'videos',
    category: 'Nature',
    requiredTime: '10:23:34',
    title: 'Jungle Giants: The Largest and Smallest Animals of the Rainforest',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: videos(7),
    uploadedBy: {
      name: 'Amazon Untamed',
      avatar: users[2].avatar,
    },
  },
  {
    id: 47,
    type: 'videos',
    category: 'Nature',
    requiredTime: '10:23:34',
    title: 'Strangest Creatures on Earth and Their Amazing Adaptations',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: videos(8),
    uploadedBy: {
      name: 'Tom Weston',
      avatar: users[3].avatar,
    },
  },
  {
    id: 48,
    type: 'videos',
    category: 'Nature',
    requiredTime: '10:23:34',
    title: 'The Challenge of Wildlife Conservation in Urban Environments',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: videos(9),
    uploadedBy: {
      name: 'David Sinclair',
      avatar: users[4].avatar,
    },
  },
  {
    id: 49,
    type: 'videos',
    category: 'Nature',
    requiredTime: '10:23:34',
    title: 'How Animals Shaped Legends, Myths, and Ancient Beliefs',
    description:
      'Pulvinar faucibus pretium nascetur harum orci? Tempore ac, consequatur hymenaeos minus, perspiciatis blandit nascetur, magni lorem! Ultricies orci, eligendi, necessitatibus eaque urna? Aspernatur quo adipisci ut urna quis, magni wisi luctus vehicula.',
    author: 'David Sinclair',
    date: '2024-8-1',
    thumbnail: videos(10),
    uploadedBy: {
      name: 'Alexander Quinn',
      avatar: users[7].avatar,
    },
  },
];

export const topics = [
  {
    id: 1,
    key: 'animal',
    label: 'Animal',
  },
  {
    id: 2,
    key: 'animal-kingdom',
    label: 'Animal Kingdom',
  },
  {
    id: 3,
    key: 'wild-animal',
    label: 'Wild Animal',
  },
  {
    id: 4,
    key: 'wild-animal',
    label: 'Wild Animal',
  },
  {
    id: 5,
    key: 'animal-name',
    label: 'Animal Name',
  },
  {
    id: 6,
    key: 'animalism',
    label: 'Animalism',
  },
  {
    id: 7,
    key: 'animal-control',
    label: 'Animal Control',
  },
  {
    id: 8,
    key: 'animal-care',
    label: 'Animal Care',
  },
  {
    id: 9,
    key: 'animal-lover',
    label: 'Animal Lover',
  },
  {
    id: 10,
    key: 'animal-sounds',
    label: 'Animal Sounds',
  },
  {
    id: 11,
    key: 'animal-tale',
    label: 'Animal Tale',
  },
  {
    id: 12,
    key: 'animal-tale',
    label: 'Animal Tale',
  },
  {
    id: 13,
    key: 'wild-animal',
    label: 'Wild Animal',
  },
  {
    id: 14,
    key: 'animal-kingdom',
    label: 'Animal Kingdom',
  },
  {
    id: 15,
    key: 'animalverse-social',
    label: 'Animalverse Social',
  },
  {
    id: 16,
    key: 'animal-tale',
    label: 'Animal Tale',
  },
  {
    id: 17,
    key: 'animal-photography',
    label: 'Animal Photography',
  },
  {
    id: 18,
    key: 'animal-farm',
    label: 'Animal Farm',
  },
  {
    id: 19,
    key: 'animal-farm',
    label: 'Animal Farm',
  },
  {
    id: 20,
    key: 'animal-communications',
    label: 'Animal Communications',
  },
  {
    id: 21,
    key: 'animal',
    label: 'Animal',
  },
  {
    id: 22,
    key: 'animal-control',
    label: 'Animal Control',
  },
  {
    id: 23,
    key: 'animal-control',
    label: 'Animal Control',
  },
  {
    id: 24,
    key: 'animal-control',
    label: 'Animal Control',
  },
  {
    id: 25,
    key: 'wild-animal',
    label: 'Wild Animal',
  },
  {
    id: 26,
    key: 'animal-training',
    label: 'Animal Training',
  },
  {
    id: 27,
    key: 'animali',
    label: 'Animali',
  },
  {
    id: 28,
    key: 'animal-house',
    label: 'Animal House',
  },
  {
    id: 29,
    key: 'animal',
    label: 'Animal',
  },
  {
    id: 30,
    key: 'animal-videos',
    label: 'Animal Videos',
  },
  {
    id: 31,
    key: 'animal-tech',
    label: 'Animal Tech',
  },
  {
    id: 32,
    key: 'animal-abuse',
    label: 'Animal Abuse',
  },
  {
    id: 33,
    key: 'animali',
    label: 'Animali',
  },
  {
    id: 34,
    key: 'animal-adoption',
    label: 'Animal Adoption',
  },
  {
    id: 35,
    key: 'animal-tech',
    label: 'Animal Tech',
  },
  {
    id: 36,
    key: 'animal-videos',
    label: 'Animal Videos',
  },
  {
    id: 37,
    key: 'animal-kingdom',
    label: 'Animal Kingdom',
  },
  {
    id: 38,
    key: 'animal-training',
    label: 'Animal Training',
  },
  {
    id: 39,
    key: 'animal-photography',
    label: 'Animal Photography',
  },
  {
    id: 40,
    key: 'animal-name',
    label: 'Animal Name',
  },
  {
    id: 41,
    key: 'animal-training',
    label: 'Animal Training',
  },
  {
    id: 42,
    key: 'animal-rescue',
    label: 'Animal Rescue',
  },
  {
    id: 43,
    key: 'animal-rescue',
    label: 'Animal Rescue',
  },
  {
    id: 44,
    key: 'animalism',
    label: 'Animalism',
  },
  {
    id: 45,
    key: 'animal-abuse',
    label: 'Animal Abuse',
  },
  {
    id: 46,
    key: 'animal-lover',
    label: 'Animal Lover',
  },
  {
    id: 47,
    key: 'animal-house',
    label: 'Animal House',
  },
  {
    id: 48,
    key: 'animal-sounds',
    label: 'Animal Sounds',
  },
  {
    id: 49,
    key: 'animal-communications',
    label: 'Animal Communications',
  },
  {
    id: 50,
    key: 'animal-house',
    label: 'Animal House',
  },
  {
    id: 51,
    key: 'animal-videos',
    label: 'Animal Videos',
  },
  {
    id: 52,
    key: 'animal-photography',
    label: 'Animal Photography',
  },
  {
    id: 53,
    key: 'animali',
    label: 'Animali',
  },
  {
    id: 54,
    key: 'animali',
    label: 'Animali',
  },
  {
    id: 55,
    key: 'animal-training',
    label: 'Animal Training',
  },
  {
    id: 56,
    key: 'animal-abuse',
    label: 'Animal Abuse',
  },
  {
    id: 57,
    key: 'animal-adoption',
    label: 'Animal Adoption',
  },
  {
    id: 58,
    key: 'animal-cartoon',
    label: 'Animal Cartoon',
  },
];

export const creators = [
  {
    id: 1,
    name: 'Wild Animal Wonders',
    uploadedCount: {
      blog: 60,
      videos: 100,
      podcasts: 50,
    },
    isFollowing: true,
  },
  {
    id: 2,
    name: 'David Sinclair',
    avatar: users[3].avatar,
    uploadedCount: {
      blog: 60,
      podcasts: 150,
    },
    isFollowing: true,
  },
  {
    id: 3,
    name: 'EcoAnimal Explorer',
    avatar: users[4].avatar,
    uploadedCount: {
      videos: 13,
      podcasts: 78,
    },
    isFollowing: false,
  },
  {
    id: 4,
    name: 'Anna Roberts',
    avatar: users[5].avatar,
    uploadedCount: {
      blog: 60,
    },
    isFollowing: false,
  },
  {
    id: 5,
    name: 'Dr. Lisa Morgan',
    avatar: users[4].avatar,
    uploadedCount: {
      blog: 60,
      podcasts: 456,
    },
    isFollowing: true,
  },
  {
    id: 6,
    name: 'James Holloway',
    avatar: users[2].avatar,
    uploadedCount: {
      blog: 60,
      videos: 127,
      podcasts: 2,
    },
    isFollowing: false,
  },
  {
    id: 7,
    name: 'Urban Animal Tales',
    uploadedCount: {
      videos: 23,
      podcasts: 567,
    },
    isFollowing: false,
  },
  {
    id: 8,
    name: 'Wild Animal Wonders',
    avatar: users[6].avatar,
    uploadedCount: {
      blog: 60,
      videos: 56,
      podcasts: 34,
    },
    isFollowing: true,
  },
  {
    id: 9,
    name: 'Animal Explorer',
    avatar: users[1].avatar,
    uploadedCount: {
      blog: 60,
      videos: 283,
    },
    isFollowing: true,
  },
  {
    id: 10,
    name: 'Animal Planetarium',
    uploadedCount: {
      videos: 32,
      podcasts: 11,
    },
    isFollowing: true,
  },
];
