# Project photo gallery

Six existing business project photos were enhanced using the built-in `imagegen` tool in edit mode on 24 September 2026. The existing scenes and gardening condition were retained, with subtle exposure, colour and shadow adjustments. Images showing weeds before work are labelled **Before clearance** rather than presented as finished work.

Photo sources are recorded in [sources.json](sources.json). Originals came from the saved Checkatrade gallery used for the initial website build; the existing original site assets remain unchanged.

Web assets are saved in `assets/img/work-{name}-enhanced-{size}.webp`. Names: `back-garden`, `lawn`, `tidy-up`, `front-garden`, `side-path`, `clearance-before`. Sizes: `480`, `960`, `full` (native generated resolution). Sharp was used only to resize and encode the finished images into WebP. Full images are fetched when the visitor opens the viewer; responsive thumbnails load lazily.

## Enhancement prompt

Use case: lighting-weather. Asset type: truthful garden contractor project-gallery photo. Edit the supplied photograph with extremely subtle professional photographic correction only: a small lift in exposure and shadow detail, neutral-warm white balance, restrained natural colour and a little noise reduction for a clearer, more appealing website photo. Preserve the EXACT existing scene and composition, camera viewpoint, all objects, every plant, fence, wall, paving, buildings, vehicles, bins, and the actual condition of the grass and weeds. Do not improve the gardening itself, do not remove weeds or debris, do not add lawn density, do not invent greenery, flowers, blue sky, sunlight or anything else. Do not turn a before photo into an after photo. Keep dry grass dry, uncut vegetation uncut, every imperfect feature intact. No object removal or replacement. No text, no watermark, no collage. Keep the original portrait 3:4 aspect ratio. The result should look like the same factual photograph with light exposure/colour correction, not a newly generated garden.

The same prompt was used with each original photograph as the image reference. These are lightly AI-retouched project photographs; the original sources remain the reference for the work shown.
