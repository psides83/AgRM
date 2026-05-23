import { Box, Typography } from '@mui/material';
import { useSettingsContext } from 'providers/SettingsProvider';
import Image from 'components/base/Image';

const BlogStory = () => {
  const {
    config: { assetsDir },
  } = useSettingsContext();

  return (
    <div>
      <Box sx={{ aspectRatio: '16 / 10', width: 1, mb: { xs: 3, md: 5 }, position: 'relative' }}>
        <Image
          src={`${assetsDir}/images/content/details/blog/1.webp`}
          fill
          sx={{
            borderRadius: 5,
            mb: { xs: 3, md: 5 },
          }}
        />
      </Box>

      <Box id="introduction" sx={{ mb: { xs: 3, mb: 5 } }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Introduction
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Architecture is more than just building design; it is a reflection of culture, history,
          and innovation. From ancient pyramids to futuristic skyscrapers, architecture shapes how
          we live and interact with our environment.
        </Typography>
      </Box>

      <Box id="evolution" sx={{ mb: { xs: 3, mb: 5 } }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          The Evolution of Architecture
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Ancient Civilizations
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          Structures like the Egyptian Pyramids and the Greek Parthenon reveal the ingenuity of
          ancient builders, blending form and function with religious and cultural significance.
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Medieval Marvels
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          Structures like the Egyptian Pyramids and the Greek Parthenon reveal the ingenuity of
          ancient builders, blending form and function with religious and cultural significance.
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Modern and Postmodern Designs
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          The 20th century saw the rise of steel and concrete, with architects like Frank Lloyd
          Wright and Zaha Hadid redefining the urban landscape.
        </Typography>
        <Box sx={{ height: 360, width: 1, mb: 1, position: 'relative' }}>
          <Image
            src={`${assetsDir}/images/content/details/blog/2.webp`}
            alt="image"
            fill
            sx={{ objectFit: 'cover' }}
          />
        </Box>
        <Typography component="p" variant="caption" sx={{ textAlign: 'center' }}>
          Fig: Image
        </Typography>
      </Box>

      <Box id="principle" sx={{ mb: { xs: 3, mb: 5 } }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Core Principles of Architecture
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Functionality
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          At its core, architecture serves the needs of its users, ensuring spaces are practical and
          efficient.
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Aesthetics
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          Designs evoke emotions, combining symmetry, balance, and innovation to create beauty.
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Modern and Postmodern Designs
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          The 20th century saw the rise of steel and concrete, with architects like Frank Lloyd
          Wright and Zaha Hadid redefining the urban landscape.
        </Typography>
        <Box sx={{ height: 150, width: 1, mb: 1, position: 'relative' }}>
          <Image
            src={`${assetsDir}/images/content/details/blog/3.webp`}
            alt="image"
            fill
            sx={{ objectFit: 'cover' }}
          />
        </Box>
        <Typography component="p" variant="caption" sx={{ textAlign: 'center' }}>
          Fig: Image
        </Typography>
      </Box>

      <Box id="iconic" sx={{ mb: { xs: 3, mb: 5 } }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Iconic Architectural Styles
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Gothic
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          Known for its pointed arches and ribbed vaults, Gothic architecture symbolizes spiritual
          aspiration.
        </Typography>
        <Typography fontWeight={7000} sx={{ mb: 1 }}>
          Baroque
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          Characterized by grandeur and drama, Baroque designs feature bold ornamentation and
          dynamic shapes.
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Minimalism
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          “Less is more” defines this style, focusing on simplicity, functionality, and natural
          materials.
        </Typography>
        <Box sx={{ height: 300, width: 1, mb: 1, position: 'relative' }}>
          <Image
            src={`${assetsDir}/images/content/details/blog/4.webp`}
            alt="image"
            fill
            sx={{ objectFit: 'cover' }}
          />
        </Box>
        <Typography component="p" variant="caption" sx={{ textAlign: 'center' }}>
          Fig: Image
        </Typography>
      </Box>

      <Box id="role-of-technology" sx={{ mb: { xs: 3, mb: 5 } }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          The Role of Technology in Architecture
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          3D Printing
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          Architects now create precise models and even full-scale structures using advanced 3D
          printing techniques.
        </Typography>
        <Typography fontWeight={700} sx={{ mb: 1 }}>
          Smart Cities
        </Typography>
        <Typography sx={{ mb: 3, color: 'text.secondary' }}>
          Technology integrates sustainability and efficiency, leading to the creation of "smart
          buildings" and urban planning innovations.
        </Typography>
      </Box>

      <Box id="future-of-architecture" sx={{ mb: { xs: 3, md: 5 } }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          The Future of Architecture
        </Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          The future of architecture lies in adaptive, responsive designs that harness artificial
          intelligence and prioritize sustainability. Urban spaces will likely evolve into
          multi-functional hubs, blending nature with advanced technologies.
        </Typography>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 3 }} id="conclusion">
          Conclusion
        </Typography>
        <Typography sx={{ mb: { xs: 3, md: 5 }, color: 'text.secondary' }}>
          Architecture is an ever-evolving discipline that harmonizes art, science, and technology.
          By learning from the past and innovating for the future, architects continue to shape the
          spaces we inhabit and inspire generations to come.
        </Typography>
      </Box>
    </div>
  );
};

export default BlogStory;
