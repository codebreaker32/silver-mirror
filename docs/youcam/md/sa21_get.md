# Check a Skin Analysis V2.1 task status.

AI tasks are asynchronous. Prefer webhook-based completion handling when the feature supports webhooks. Configure your webhook endpoint, verify webhook signatures, and use the received `task_id` to query the task result after a `success` or `error` notification. See the [webhook integration guide](/develop/webhook) for setup and verification details.
If webhooks are not supported or cannot be used in your integration, implement polling. After submitting an AI task, poll the status endpoint at regular intervals (e.g., every 10 seconds) until the task status is `success` or `error`.

Endpoint: GET /s2s/v2.1/task/skin-analysis/{task_id}
Security: BearerAuthenticationV2

## Security:

  - `BearerAuthenticationV2` (unknown)
    http bearer

## Path parameters:

  - `task_id` (string, required)
    ID of task to check

## Response 200:

  - `200` (unknown)
    Successful check of Skin Analysis task status

## Response 200 fields (application/json):

  - `status` (integer)
    Response status
    Example: 200

  - `data` (object)

  - `data.task_status` (string)
    Status of this task
    Enum: "running", "success", "error"

  - `data.error` (string)
    Errors:
- `error_exceed_max_image_size`  - Input image size exceeds the maximum limit
- `exceed_max_filesize` - Input file size exceeds the maximum limit
- `invalid_parameter` - Invalid parameter value
- `error_download_image` - Download source image error
- `error_download_mask` - Download mask image error
- `error_decode_image` - Decode source image error
- `error_decode_mask` - Decode mask image error
- `error_nsfw_content_detected` - NSFW content detected in source image
- `error_no_face` - No face detected on source image
- `error_pose` - Failed to detect pose on source image
- `error_face_parsing` - Failed to do face segmentation on source image
- `error_inference` - Inference pipeline error
- `exceed_nsfw_retry_limits` - Exceed the retry limits to avoid generated NSFW image
- `error_upload` - Upload result image error
- `unknown_internal_error` - Others
    Enum: "error_exceed_max_image_size", "exceed_max_filesize", "invalid_parameter", "error_download_image", "error_download_mask", "error_decode_image", "error_decode_mask", "error_nsfw_content_detected", "error_no_face", "error_pose", "error_face_parsing", "error_inference", "exceed_nsfw_retry_limits", "error_upload", "unknown_internal_error"

  - `data.error_message` (string)
    Detailed description of error

  - `data.results` (any)

  - `data.results.url` (string, required)
    URL to download this result. Valid for 2 hours. The returned ZIP file contains a skinanalysisResult folder of a score_info.json file with all detection result scores and images of all detection results. When the Advanced Skin Report or Product Recommendation is requested, the folder also contains llm_results.json. Only available when format is `zip`.
    Example: https://example.com/sample-result-url

  - `data.results.output` (array, required)
    The analysis result returned directly in the response body as JSON format. When the Advanced Skin Report or Product Recommendation is requested, the output also has an item whose `type` is `llm_results`; its `mask_urls[0]` is the URL of llm_results.json. Only available when format is `json`.

  - `data.results.output.type` (string)
    The action of Skin Analysis
    Example: hd_skin_type

  - `data.results.output.region` (string)
    The region of the face where the analysis is focused
    Example: whole

  - `data.results.output.raw_score` (number)
    A floating-point value ranging from 1 to 100. The raw_score refers to the score directly predicted by the AI model
    Example: 98.5

  - `data.results.output.ui_score` (integer)
    An integer ranging from 1 to 100. The ui_score is the adjusted score based on the raw score
    Example: 97

  - `data.results.output.score` (number)
    A floating-point value between 1 and 100 representing the general skin condition.
    Example: 97.66

  - `data.results.output.mask_urls` (array)
    The URLs of the mask images or resized images generated during analysis

## Response 400:

  - `400` (unknown)
    Invalid task ID

## Response 400 fields (application/json):

  - `status` (integer)
    Response status
    Example: 400

  - `error` (string)
    Example: Invalid task ID

## Response 401:

  - `401` (unknown)
    Invalid or missing API key

## Response 401 fields (application/json):

  - `status` (integer)
    Response status
    Example: 401

  - `error` (string)
    Example: Invalid API key

## Response 500:

  - `500` (unknown)
    Task execution timeout

## Response 500 fields (application/json):

  - `status` (integer)
    Response status
    Example: 500

  - `error` (string)
    Example: Task execution timed out

## Response 200 examples:

  - `Response when format=zip (success)` (unknown)
    Task completed successfully. Results are packaged as a ZIP file.

  - `Response when format=json (success)` (unknown)
    Task completed successfully. Results are returned directly as JSON with detailed scores and image URLs.

