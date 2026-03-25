import { getAssetPreviewUrl } from "@/lib/supabase/storage";

export interface Footage {
  id: string;
  filename: string;
  title: string;
  tags: string[];
  resolution: string;
  orientation: "horiz" | "vert";
  duration: "short" | "medium" | "long";
  fps: string;
  hasAudio: boolean;
  author: string;
  uploadedBy: string;
  previewUrl: string;
  downloadUrl: string;
}

function parseFilename(filename: string): Footage {
  // Pattern: [tags]_Title-Words_Resolution_orientation_duration_fps_audio_by-Author_idXXXX.mp4
  const noExt = filename.replace(".mp4", "");

  // Extract tags
  const tagMatch = noExt.match(/^\[([^\]]+)\]/);
  const tags = tagMatch ? tagMatch[1].split("_") : [];

  // Remove tags prefix
  const rest = noExt.replace(/^\[[^\]]+\]_/, "");

  // Split by underscore
  const parts = rest.split("_");

  // Title is the first part (hyphenated words)
  const title = parts[0]?.replace(/-/g, " ") ?? noExt;

  // Find resolution, orientation, duration, fps, audio, author
  const resolution = parts.find((p) => /^(HD|3K|4K|4-6K)$/i.test(p)) ?? "";
  const orientation = parts.includes("vert") ? "vert" as const : "horiz" as const;
  const duration = (parts.find((p) => /^(short|medium|long)$/.test(p)) ?? "medium") as Footage["duration"];
  const fps = parts.find((p) => /^\d+fps$/.test(p)) ?? "";
  const hasAudio = parts.includes("audio");

  // Author: everything after "by-" until "_id"
  const authorMatch = noExt.match(/by-([^_]+)_id/);
  const author = authorMatch ? authorMatch[1].replace(/-/g, " ") : "";

  // ID
  const idMatch = noExt.match(/id(\d+)$/);
  const id = idMatch ? idMatch[1] : noExt;

  return {
    id,
    filename,
    title,
    tags,
    resolution,
    orientation,
    duration,
    fps,
    hasAudio,
    author,
    uploadedBy: "Overlens",
    previewUrl: getAssetPreviewUrl("Footages", filename),
    downloadUrl: `/api/footages/download?file=${encodeURIComponent(filename)}`,
  };
}

// Statically list all preview filenames
const PREVIEW_FILES: string[] = [
  "[2d-animation_3d]_Cgi-Unraveling-Animation-3d_HD_horiz_long_24fps_noaudio_by-HIROSHI-TAKAGISHI_id516509.mp4",
  "[2d-animation_3d_human_performance]_Dancing-Character-Animation-3d_4K_horiz_long_24fps_noaudio_by-Frame-Stock-Footage_id358186.mp4",
  "[2d-animation_3d_pattern]_Waves-Dazzling-Animated-3d_4K_horiz_medium_24fps_noaudio_by-Finn-Moeller_id6114874.mp4",
  "[2d-animation_abstract_background_geometric]_Shapes-Rings-Animated-Background_4K_horiz_medium_25fps_noaudio_by-Finn-Moeller_id504597.mp4",
  "[2d-animation_abstract_geometric]_Circles-Shapes-Rings-Animated_4K_horiz_medium_25fps_noaudio_by-Finn-Moeller_id504596.mp4",
  "[2d-animation_background_colorful_human]_Character-Colorful-Pink-Background_4K_horiz_short_24fps_audio_by-Motion-Library_id6096967.mp4",
  "[2d-animation_background_geometric]_Colors-Black-Background-Animated_4K_horiz_medium_24fps_noaudio_by-Arthur-Cauty_id608414.mp4",
  "[2d-animation_background_particles]_Animated-Background-Blurry-Particles_4K_vert_long_30fps_noaudio_by-Animedias_id6365737.mp4",
  "[2d-animation_background_retro]_Cartoon-Background-2d-Retro_HD_horiz_medium_30fps_noaudio_by-Moving-Art-By-Lior-Sadeh_id6051284.mp4",
  "[2d-animation_background_retro_tech_time]_Background-2d-Retro-Digital_HD_horiz_long_30fps_noaudio_by-Moving-Art-By-Lior-Sadeh_id6051287.mp4",
  "[2d-animation_colorful]_2d-Animated-Multicolored-Moving_4K_horiz_medium_24fps_audio_by-Motion-Library_id6016989.mp4",
  "[2d-animation_geometric_glowing]_Animated-Glowing-Colors-Rings_4K_horiz_medium_25fps_noaudio_by-Finn-Moeller_id504572.mp4",
  "[2d-animation_glowing]_2d-Gradient-Glow-Motion_4K_horiz_short_24fps_audio_by-Motion-Library_id6110706.mp4",
  "[2d-animation_retro]_2d-Retro-Vintage-Cartoon_HD_horiz_medium_30fps_noaudio_by-Moving-Art-By-Lior-Sadeh_id6051295.mp4",
  "[2d-animation_water]_Animation-Dissolve-Liquid-Effect_4K_horiz_short_25fps_noaudio_by-Jmg-visuals_id291903.mp4",
  "[3d_abstract_background]_3d-Shapes-Background-Motion_4K_horiz_medium_24fps_noaudio_by-Connect-Films-Stock_id6027695.mp4",
  "[3d_background_loop]_3d-Background-Vj-Loop_4K_horiz_medium_24fps_noaudio_by-Connect-Films-Stock_id6027524.mp4",
  "[3d_colorful_human]_Woman-Colorful-Cgi-Face_HD_horiz_medium_30fps_noaudio_by-HIROSHI-TAKAGISHI_id516499.mp4",
  "[3d_colorful_texture]_Prism-Vfx-Rainbow-Light_4-6K_horiz_medium_25fps_noaudio_by-Thomas-Gellert_id564899.mp4",
  "[3d_education]_Math-Rocket-Board-3d_4K_horiz_medium_24fps_noaudio_by-Jordan-Clarke_id628705.mp4",
  "[3d_geometric_loop]_3d-Looping-Cubes-Popping_4K_vert_medium_30fps_noaudio_by-Juanjo-McLittle_id6462842.mp4",
  "[3d_human]_Cgi-Contemporary-Modern-Art_HD_horiz_short_30fps_audio_by-HIROSHI-TAKAGISHI_id514904.mp4",
  "[3d_human]_Statue-Parts-Face-Cgi_HD_horiz_medium_30fps_noaudio_by-HIROSHI-TAKAGISHI_id516501.mp4",
  "[3d_loop_tech]_3d-Mealting-Brain-Looping_4K_horiz_medium_25fps_noaudio_by-FlashMovie_id6521250.mp4",
  "[3d_loop_tech]_Brain-3d-Artifical-Intelillence_4K_horiz_medium_25fps_noaudio_by-Daniel-Megias-Del-Pozo_id6161218.mp4",
  "[3d_particles]_Energy-Pink-3d-Electromagnetic_4K_horiz_medium_25fps_noaudio_by-ORIGAMO_id6000181.mp4",
  "[3d_sci-fi]_Graphic-Futuristic-Robot-Compositing_4-6K_horiz_medium_25fps_noaudio_by-Frame-Stock-Footage_id368528.mp4",
  "[3d_space]_Earth-Future-Communication-Vfx_4K_vert_medium_25fps_noaudio_by-Frame-Stock-Footage_id6184577.mp4",
  "[abstract_colorful_dark-mood]_Rainbow-Colorful-Abstract-Dark_4-6K_horiz_long_25fps_noaudio_by-Kristian-Ozer-Kettner_id261555.mp4",
  "[abstract_colorful_nature]_Abstract-Nature-Diagonal-Lines_4-6K_horiz_medium_25fps_noaudio_by-Omri-Ohana_id179747.mp4",
  "[abstract_colorful_water]_Abstract-Colorful-Rainbow-Soap_4-6K_horiz_long_25fps_noaudio_by-Kristian-Ozer-Kettner_id261556.mp4",
  "[abstract_dark-mood_water]_Soap-Round-Dark-Abstract_4-6K_horiz_medium_25fps_noaudio_by-Kristian-Ozer-Kettner_id261558.mp4",
  "[abstract_glitch_texture]_Noise-Abstract-Glitch-Glitch_4K_horiz_medium_25fps_noaudio_by-Hermit-Sage-Creative-Studio_id6592078.mp4",
  "[abstract_loop]_Graphics-Geometric-Wireframe-Loop_4K_horiz_medium_24fps_noaudio_by-Connect-Films-Stock_id6027550.mp4",
  "[abstract_loop_physics]_Shapes-Balance-Loop-Movement_4K_horiz_medium_30fps_noaudio_by-Juanjo-McLittle_id6081705.mp4",
  "[aerial]_Desert-Hatta-Drone-Fpv_4K_horiz_medium_25fps_noaudio_by-Thomas-Gellert_id6517827.mp4",
  "[aerial_nature]_Saudi-Arabia-Drone-Estuary_4K_horiz_long_30fps_noaudio_by-Abo-ngam_id6577058.mp4",
  "[aerial_nature]_Yellow-Daisy-Flourish-Nature_4K_horiz_medium_25fps_noaudio_by-Gundars-Magone_id6201407.mp4",
  "[aerial_sci-fi]_Sand-Illuminated-Sci-Fi_3K_horiz_medium_24fps_noaudio_by-Omri-Ohana_id617758.mp4",
  "[background_colorful_geometric]_Hue-Circle-Multicolor-Background_4K_horiz_long_30fps_noaudio_by-Animedias_id6210216.mp4",
  "[background_colorful_glowing_loop]_Background-Neon-Colorful-Loop_4K_horiz_medium_30fps_noaudio_by-ORIGAMO_id6037045.mp4",
  "[background_colorful_glowing_loop]_Glowing-Black-Background-Colorful_4K_horiz_medium_25fps_noaudio_by-Finn-Moeller_id646188.mp4",
  "[background_colorful_loop_water]_Loop-Black-Background-Bubble_4K_horiz_long_24fps_noaudio_by-Alejandro-Campollo_id6040073.mp4",
  "[background_creative]_Background-Kiss-Fashion-Model_3K_horiz_medium_25fps_noaudio_by-Ira-Belsky_id766522.mp4",
  "[background_creative]_Blur-Projection-Fashion-Model_3K_horiz_medium_25fps_noaudio_by-Ira-Belsky_id766523.mp4",
  "[background_loop_pattern]_Background-Loophole-Vj-Tunnel_HD_horiz_long_30fps_noaudio_by-Savagerus_id740299.mp4",
  "[background_loop_tech]_Background-Vj-Blue-Data_4K_horiz_medium_30fps_noaudio_by-ORIGAMO_id689032.mp4",
  "[cinema_dark-mood]_Film-Roll-Film-Photography_4-6K_horiz_medium_24fps_noaudio_by-Hugo-Will_id6471346.mp4",
  "[colorful_glowing_particles]_Luminous-Experimental-Colorful-Explosion_4K_horiz_medium_30fps_audio_by-Nicolas-Arnold_id6078757.mp4",
  "[craft]_Architecture-Pencile-Blueprint-Drawing_4-6K_horiz_medium_25fps_noaudio_by-Videophilia_id6301478.mp4",
  "[craft]_Measuring-Ruler-Sketch-Desk_4-6K_horiz_medium_25fps_noaudio_by-Film-Spirits_id630420.mp4",
  "[craft]_Wood-Beams-Wood-Carpentry_4K_horiz_long_25fps_noaudio_by-Polina-Borisova_id749307.mp4",
  "[creative_human_nature]_Man-Dreamer-Creative-Flowers_4-6K_horiz_long_24fps_noaudio_by-Phong-Croco_id6541788.mp4",
  "[creative_human_street-art]_Woman-Spray-Paint-Can_4-6K_horiz_long_25fps_noaudio_by-Eugene-Nikitin_id6463861.mp4",
  "[creative_loop]_Blur-Fashion-Model-Projection_3K_horiz_medium_25fps_noaudio_by-Ira-Belsky_id766528.mp4",
  "[dark-mood_sci-fi]_Eerie-Ominous-Modulation-Sci_4K_horiz_long_30fps_noaudio_by-RIVERSCOPE_id6547436.mp4",
  "[dark-mood_sci-fi]_Eerie-Ominous-Modulation-Sci_4K_horiz_medium_30fps_noaudio_by-RIVERSCOPE_id6547418.mp4",
  "[dark-mood_sci-fi]_Eerie-Ominous-Modulation-Sci_HD_horiz_medium_30fps_noaudio_by-RIVERSCOPE_id6547416.mp4",
  "[dark-mood_sci-fi]_Eerie-Ominous-Modulation-Sci_HD_horiz_medium_30fps_noaudio_by-RIVERSCOPE_id6547455.mp4",
  "[finance]_Change-Cash-Money-Mixed_4K_horiz_medium_24fps_audio_by-Angelicami-lash_id765415.mp4",
  "[finance_tech]_Graph-Stock-Market-Data_4K_horiz_medium_25fps_noaudio_by-Up-North-Studio_id343239.mp4",
  "[food]_Phantom-Falling-Nuts-Walnuts_4K_horiz_long_30fps_noaudio_by-Soraphotography_id462124.mp4",
  "[geometric]_Black-And-White-Poke_4K_horiz_medium_25fps_noaudio_by-Escape-Routine_id6351632.mp4",
  "[geometric_glowing_texture]_Shiny-Sphere-Texture-Shape_4K_horiz_long_24fps_noaudio_by-Alejandro-Campollo_id6015234.mp4",
  "[geometric_loop_water]_Ocean-Loop-Vj-Circle_4K_horiz_medium_30fps_noaudio_by-Oksana-Kumer_id6372876.mp4",
  "[glitch_tech]_Computer-Screen-Digital-Interference_HD_horiz_long_25fps_noaudio_by-Pixel-DNA_id6113643.mp4",
  "[glowing_loop]_Lines-Vj-Sound-Glowing_4K_horiz_medium_25fps_noaudio_by-ORIGAMO_id689031.mp4",
  "[glowing_overlay]_Grid-Outlines-Overlays-Glowing_HD_horiz_medium_25fps_noaudio_by-Pixel-DNA_id6311599.mp4",
  "[glowing_texture]_Shiny-Texture-Shape-Glowing_4K_horiz_long_24fps_noaudio_by-Alejandro-Campollo_id6015215.mp4",
  "[glowing_texture]_Shiny-Texture-Shape-Glowing_4K_horiz_long_24fps_noaudio_by-Alejandro-Campollo_id6015216.mp4",
  "[human]_Hand-Fingers-Blue-Typing_4K_horiz_medium_25fps_audio_by-Videophilia_id275143.mp4",
  "[human]_White-Statue-David-Slices_4K_horiz_short_30fps_noaudio_by-Bruno-Tornielli_id715296.mp4",
  "[human_loop]_Vj-Loop-Personality-Mind_HD_horiz_long_25fps_noaudio_by-Pixel-DNA_id6128312.mp4",
  "[human_loop_tech]_Ai-Vj-White-Portrait_4K_horiz_medium_25fps_noaudio_by-Pixel-DNA_id6151411.mp4",
  "[human_performance_sci-fi]_Futuristic-Dancing-Silhouette-Human_4K_horiz_short_25fps_noaudio_by-Jmg-visuals_id700724.mp4",
  "[human_sci-fi]_Wearing-Man-Metaverse-Virtual_4K_horiz_medium_25fps_noaudio_by-Stockbusters_id582336.mp4",
  "[human_tech]_Eyelid-Code-Opening-Script_HD_horiz_medium_25fps_noaudio_by-Maxim-Ronkin_id699704.mp4",
  "[human_tech]_Script-Eyelid-Computer-Code_4-6K_horiz_medium_25fps_noaudio_by-Maxim-Ronkin_id699720.mp4",
  "[human_texture]_Eye-Reflecting-Staring-Streaks_HD_horiz_medium_25fps_noaudio_by-Maxim-Ronkin_id699714.mp4",
  "[loop_pattern]_Seamless-Topography-Blue-Loop_4K_horiz_long_24fps_noaudio_by-Finn-Moeller_id6075604.mp4",
  "[loop_water]_Water-Loop-Daylight-Ocean_4K_horiz_medium_30fps_noaudio_by-Oksana-Kumer_id6375729.mp4",
  "[nature]_Arri-Plant-Wings-Delicate_HD_horiz_medium_25fps_noaudio_by-MXR-Productions_id6313022.mp4",
  "[nature]_Grain-Wheat-Field-Sunlight_4K_horiz_long_25fps_noaudio_by-Evgenii-Petrunin_id593716.mp4",
  "[nature]_Long-grass-moving-in_HD_horiz_short_24fps_noaudio_by-Brandon-Li_id66420.mp4",
  "[nature]_Unfolding-Opening-Flowering-Blooming_4K_horiz_medium_24fps_noaudio_by-Finn-Moeller_id6101255.mp4",
  "[nature_sky]_Sky-Trees-Plant-Clearing_4-6K_horiz_medium_30fps_noaudio_by-Igor-Tichonow_id655865.mp4",
  "[nature_space]_Green-Planet-Plant-Growing_4K_horiz_long_30fps_noaudio_by-Phantom-Gravity_id353667.mp4",
  "[nature_water]_Micro-Greens-Drops-Plant_4-6K_horiz_long_25fps_noaudio_by-Ira-Belsky_id431509.mp4",
  "[nature_water_wildlife]_Forest-Water-Droplets-Beetle_4K_horiz_long_24fps_noaudio_by-Leftyphoto_id6292097.mp4",
  "[nature_wildlife]_Bee-taking-flight-from_4-6K_horiz_medium_25fps_noaudio_by-Omri-Ohana_id80934.mp4",
  "[nature_wildlife]_Monarch-butterfly-taking-off_4-6K_horiz_medium_24fps_audio_by-Dan-Ludeman_id62228.mp4",
  "[performance]_Criminal-Microphone-Rap-Gangster_4-6K_horiz_medium_25fps_noaudio_by-Thomas-Gellert_id6099777.mp4",
  "[physics_texture]_Metal-Newtons-Cradle-Balls_4-6K_horiz_medium_24fps_noaudio_by-Arthur-Cauty_id6201037.mp4",
  "[sci-fi]_RUKA-ROBOTA_4-6K_horiz_medium_25fps_audio_by-Frame-Stock-Footage_id368526.mp4",
  "[sky_space]_Earth-Clouds-Space-Rotating_4-6K_horiz_medium_25fps_noaudio_by-Piotrek-Naumowicz_id662064.mp4",
  "[space]_Planet-Earth-Solar-Galaxy_4K_horiz_long_30fps_noaudio_by-Bruno-Tornielli_id710611.mp4",
  "[space_water]_Panasonic-Lumix-Dc-Gh5_4K_horiz_long_24fps_noaudio_by-Timothy-McGlinchey_id256777.mp4",
  "[space_water]_Surface-Beautiful-Planet-Bubble_4K_horiz_long_24fps_noaudio_by-Timothy-McGlinchey_id256775.mp4",
  "[tech]_Brain-Communication-Digital-Creativity_4K_horiz_long_30fps_noaudio_by-Cinematic-Vision_id6429445.mp4",
  "[tech]_Genetics-Biology-Chain-Dna_4K_horiz_medium_24fps_audio_by-GIADA-CANU_id729648.mp4",
  "[texture]_Cd-Light-Surface-Texture_4K_horiz_medium_24fps_noaudio_by-Arthur-Cauty_id6115127.mp4",
  "[texture]_Light-Streaks-Thrilling-Optics_4K_horiz_medium_24fps_noaudio_by-Finn-Moeller_id6113434.mp4",
  "[texture]_Metallic-Sheen-Molten-Metal_4K_horiz_long_30fps_noaudio_by-Cinematic-Vision_id6353188.mp4",
  "[time]_Clock-on-the-shelf_4-6K_horiz_medium_25fps_noaudio_by-Brad-Day_id178295.mp4",
  "[time]_Hours-Timer-Seconds-Ticking_4-6K_horiz_medium_24fps_noaudio_by-Arthur-Cauty_id6179078.mp4",
  "[underwater_water_wildlife]_Octopus-Ocean-Sea-Creature_4K_horiz_medium_24fps_noaudio_by-Ami-Bornstein_id6343131.mp4",
  "[untagged]_Pictures-Wall-Dressmaking-Design_4K_horiz_medium_25fps_audio_by-Pressmaster_id573590.mp4",
  "[water_wildlife]_Water-Toad-Amphibian-Swamp_4K_horiz_long_25fps_audio_by-Lukas-Pich_id458964.mp4",
  "[wildlife]_Formicidae-Arthropoda-Insect-Bug_HD_horiz_long_24fps_noaudio_by-Ivan-Kmeel_id6082262.mp4",
];

export const footages: Footage[] = PREVIEW_FILES.map(parseFilename);

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  for (const f of footages) {
    for (const t of f.tags) {
      tagSet.add(t);
    }
  }
  return Array.from(tagSet).sort();
}
