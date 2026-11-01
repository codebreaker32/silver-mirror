# Overview

The AI Makeup API provides a powerful, hyper-realistic virtual makeover experience powered by our patented face-analyzing technology. This service enables your applications to apply true-to-life makeup effects onto user-provided selfie images with unprecedented customization capabilities.

**Key Features:**

* **Hyper-realistic Rendering:** Leverages revolutionary 3D face AI technology for the most realistic makeovers.
* **Patented Technology:** Powered by jitter-free, lag-free deep learning algorithms optimized for all ages and ethnicities.
* **Real-time Precision:** Ultra-precise facial tracking that adapts to various lighting conditions.
* **True-to-life Matching:** Accurately matches real-world product colors, textures (from matte to metallic), and finishes.
* Core Concepts
  * Color Blending
Our AI accurately matches the color of real-life makeup products using deep learning. This ensures consumers are confident that the virtual color they see is the true color of the product they intend to purchase.
  * Texture & Finish Matching
The technology simulates realistic textures and finishes, providing a highly accurate makeover experience. From matte to metallic, shimmer to satin, the AI taps into advanced algorithms to render these effects seamlessly in real-time.
  * Light Balancing
The smart 3D AI engine detects lighting conditions in the user's photo or video feed. It corrects images for true-to-life makeup application, ensuring a consistent and high-quality result regardless of the environment.


## Integration Guide

The Makeup Virtual Try-On service operates as an asynchronous task. You must first initiate a makeup processing task by providing the image URL and a list of desired effects. The server responds with a `task_id`. You then periodically poll a status endpoint to retrieve the final result or any errors.

* **Endpoint:** `/v2.0/task/makeup-vto`
* **Authentication:** All requests require an `Authorization: Bearer <TOKEN>`
* **Workflow:**
  1. **Prepare a selfie:** Upload an image or use existing file url of a face image.
  2. **Start Task (`POST`):** Submit your image id/URL and makeup configuration.
  3. **Retrieve Task ID:** Capture the `task_id` from the response.
  4. **Poll Status (`GET`):** Use the `task_id` to check the status of the task. Continue polling until `task_status` is `"success"` or `"error"`.
* API Playground


Interactively explore and test the API using our official playground:

**API Playground:**
[http://yce.makeupar.com/api-console/en/api-playground/ai-makeup-virtual-try-on/](http://yce.makeupar.com/api-console/en/api-playground/ai-makeup-virtual-try-on/)

* Authentication


- Include your API key in the request header using **Bearer Token**:

```
Authorization: Bearer <API Key>
```


You can find your API Key at https://yce.makeupar.com/api-console/en/api-keys/.

*   1. Upload a Selfie
You can provide the source image in one of two ways:
  - **Use an Existing Public Image URL**
Instead of uploading, you may supply a publicly accessible image URL directly when initiating the AI task.
  - **Upload via File API**
Use the endpoint:

```
POST /s2s/v2.0/file
```
This returns a `file_id` for subsequent task execution.
    - ***Important***: Simply calling the File API does not upload your file. You must **manually upload** the file to the **URL provided in the File API response**. That URL is your upload destination, make sure the file is successfully transferred there before proceeding.
Before calling the AI API, ensure your file has been successfully uploaded. Use the File API to retrieve an upload URL, then upload your file to that location. Once the upload is complete, you'll receive a ***file_id*** in the response, this ID is what you'll use to access AI features related to that file.
> **Warning:** Please note that, you will get an 500 Server Error / unknown_internal_error or 404 Not Found error when using AI APIs if you do not upload the file to the URL provided in the File API response.
*   1. Start Makeup Task


`POST /s2s/v2.0/task/makeup-vto`

Initiates a new virtual makeup task on the provided image. This endpoint is asynchronous and returns with a `task_id`.

* Request Headers


| Header | Value |
|  --- | --- |
| Content-Type | `application/json` |
| Authorization | `Bearer YOUR_API_KEY` |


* Example Request Body


```json
{
  "src_file_url": "https://plugins-media.makeupar.com/strapi/assets/sample_Image_1_202b6bf6e6.jpg",
  "effects": [
    {
      "category": "blush",
      "pattern": { "name": "2colors6" },
      "palettes": [
        { "color": "#FF0000", "texture": "matte", "colorIntensity": 50 },
        { "color": "#F2A53E", "texture": "matte", "colorIntensity": 50 }
      ]
    },
    {
      "category": "eye_liner",
      "pattern": { "name": "3colors5" },
      "palettes": [
        { "color": "#000000", "texture": "matte", "colorIntensity": 50 },
        { "color": "#BA0656", "texture": "matte", "colorIntensity": 50 },
        { "color": "#089085", "texture": "matte", "colorIntensity": 50 }
      ]
    }
  ],
  "version": "1.0"
}
```

* Request Body Schema


| Field | Type | Description |
|  --- | --- | --- |
| `src_file_url` | string (URL) | A publicly accessible URL to the selfie image to be processed. |
| `effects` | array of Effect | An array of makeup effects objects to apply. See [Makeup Effect Schemas](#makeup-effect-schemas) for details. |
| `version` | string | The API version of the effect payload structure. Use `"1.0"`. |


* Successful Response (`200 OK`)
Returns a JSON object containing the task identifier.


**Response Body Schema:**

```json
{
  "status": 200,
  "data": {
    "task_id": "<string>"
  }
}
```

**Example Response:**

```json
{
  "status": 200,
  "data": {
    "task_id": "grH0CvsgXuAIHLUzD0V1Ol34hoet3R1tvdbtiVHrDb6_UqCLKIejAIajwxrhOAfe"
  }
}
```

* Error Responses (`400 Bad Request`, `401 InvalidApiKey`, etc.)
A standard error object will be returned with a message describing the failure.


**Example Error Response:**

```json
{
  "status": 400,
  "error": "The operation could not be completed",
  "error_code": "CreditInsufficiency"
}
```

*   1. Get Task Status & Results


`GET /s2s/v2.0/task/makeup-vto/<task_id>`

Retrieves the current status and results of an in-progress or completed task.

* Request Headers


| Header | Value |
|  --- | --- |
| Authorization | `Bearer YOUR_API_KEY` |


* Path Parameters


| Parameter | Type | Description |
|  --- | --- | --- |
| task_id | string | The identifier returned from the start-task endpoint. |


* Successful Response (`200 OK`)
A JSON object containing the status and, if completed, the results.


**Response Body Schema:**

```json
{
  "data": {
    "task_status": "<string>", // 'success', 'error', or a processing state (e.g., 'queued', 'processing')
    "results": [ // present only when task_status is 'success'
      {
        "download_url": "<string>" // URL to download the processed image
      }
    ],
    "failure_reason": "<string>" // present only when task_status is 'error'
  }
}
```

**Example Success Response:**

```json
{
  "status": 200,
  "data": {
    "task_status": "success",
    "results": {
      "url": "https://s3.storage.prod/processed/image_123.jpg?token=..."
    }
  }
}
```

**Example Engine Error Response:**
The API query was sent successfully; however, an error occurred while executing the AI task.

```json
{
  "status": 200,
  "data": {
    "task_status": "error",
    "error": "exceed_max_filesize",
    "error_message": "string",
  }
}
```

> Please note that no units will be consumed if an error occurs, whether it is a query error or an engine error.


**Example In-Progress Response:**

```json
{
  "status": 200,
  "data": {
    "task_status": "running"
  }
}
```

* Error Responses
* `404 InvalidTaskId`: The `task_id` does not exist or is invalid.
* `401 InvalidApiKey`: The API key is invalid or missing.
* `500 TaskTimeout`: The task has either completed successfully or failed and has exceeded the retention period.


**Example Query Error Response:**

```json
{
  "status": 401,
  "error_code": "InvalidApiKey"
}
```

> Please note that no units will be consumed if an error occurs, whether it is a query error or an engine error.


## Inputs & Outputs

* Makeup Effect Schema


This section defines the complete structure and constraints for the request body of an AI Makeup task. Each effect is an object in the top-level `effects` array.

* Effect Container (Top Level)


```json
{
  "version": "1.0",
  "effects": []                    // array<Effect> — Contains makeup effect objects
}
```

* Makeup Effect Categories
  * `skin_smooth`


```json
{
  "category": "skin_smooth",           // string, const "skin_smooth"
  "skinSmoothStrength": 50,            // integer, range: 0..100
  "skinSmoothColorIntensity": 50       // integer, range: 0..100
}
```

> **Note!** If no `skin_smooth` effect is included in the request, the AI Makeup Engine will automatically apply a default Skin Smooth value of 50.
Set all `skinSmoothStrength` and `skinSmoothColorIntensity` parameters to 0 if you want makeup applied with no skin smoothing. However, for best results and highest-quality blending, it is recommended to leave the default skin smoothing enabled.


* `blush`


```json
{
  "category": "blush",                 // string, const "blush"
  "pattern": {                         // object
    "name": ""                         // string — MUST equal a `label` from blush.json
  },
  "palettes": [                        // array<BlushPalette>, minItems: (see colorNum in pattern)
    {
      "color": "#ff0000",              // string, hex color "#RRGGBB"
      "texture": "matte",              // string, enum ["matte","satin","shimmer"]
      "glowStrength": 50,              // integer, range: 0..100 — REQUIRED if texture="satin"
      "shimmerColor": "#fc288f",       // string, hex color "#RRGGBB" — REQUIRED if texture="shimmer"
      "shimmerDensity": 50,            // integer, range: 0..100 — REQUIRED if texture="shimmer"
      "colorIntensity": 50             // integer, range: 0..100
    }
  ]
}
```

**Full Pattern Catalog:**
https://plugins-media.makeupar.com/wcm-saas/patterns/blush.json

**Distinct Makeup Pattern Categories:**

```json
[
  {
    "category": "1 color",
    "label": "1color1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/483/a53cd4f4-43b6-4e19-b85a-ec7a95c6a47f.jpg",
    "tags": [
      { "id": 100, "name": "Blush 3D" },
      { "id": 103, "name": "Oblong" }
    ],
    "colorNum": 1
  },
  {
    "category": "2 colors",
    "label": "2colors1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/147/a8d86a4b-8aa0-48d7-a716-63ec78dfb30b.jpg",
    "tags": [
      { "id": 100, "name": "Blush 3D" }
    ],
    "colorNum": 2
  },
  {
    "category": "3 colors",
    "label": "3colors1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/734/af8b625b-ae3a-4211-9413-f22c16a5f174.jpg",
    "tags": [
      { "id": 100, "name": "Blush 3D" },
      { "id": 104, "name": "Round" }
    ],
    "colorNum": 3
  }
]
```

* `bronzer`


```json
{
  "category": "bronzer",               // string, const "bronzer"
  "pattern": { "name": "" },           // object — name MUST equal a `label` from bronzer.json
  "palettes": [
    { "color": "#ff0000", "colorIntensity": 50 }  // hex color, int range: 0..100
  ]
}
```

**Full Pattern Catalog:**
https://plugins-media.makeupar.com/wcm-saas/patterns/bronzer.json

**Distinct Makeup Pattern Categories:**

```json
[
  {
    "category": "Bronzer",
    "label": "Bronzer1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/973/22ff2c07-d584-4ae6-8281-c095cd121a52.jpg",
    "tags": [],
    "colorNum": 1
  }
]
```

* `concealer`


```json
{
  "category": "concealer",             // string, const "concealer"
  "palettes": [
    {
      "color": "#ff0000",              // string, hex color "#RRGGBB"
      "colorIntensity": 50,            // integer, range: 0..100
      "colorUnderEyeIntensity": 50,    // integer, range: 0..100
      "coverageLevel": 50              // integer, range: 0..100
    }
  ]
}
```

* `contour`


```json
{
  "category": "contour",               // string, const "contour"
  "pattern": { "name": "" },           // object — name MUST equal a `label` from contour.json
  "palettes": [
    { "color": "#ff0000", "colorIntensity": 50 }  // hex color, int range: 0..100
  ]
}
```

**Full Pattern Catalog:**
https://plugins-media.makeupar.com/wcm-saas/patterns/contour.json

**Distinct Makeup Pattern Categories:**

```json
[
  {
    "category": "Heart face",
    "label": "HeartFace2",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/731/49a1b3b9-b393-4bf4-b486-1493fe468436.jpg",
    "tags": []
  },
  {
    "category": "Invtriangle",
    "label": "Invtriangle1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/858/a94c8cca-5f8c-4b8b-a02d-94edb6a4ad7f.jpg",
    "tags": []
  },
  {
    "category": "Oval face",
    "label": "OvalFace6",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/906/644368a3-7eee-4ad9-829e-e2b3d4320fec.jpg",
    "tags": []
  },
  {
    "category": "Round face",
    "label": "RoundFace4",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/106/3e455b5f-7e2d-46f7-8627-dc137051c144.jpg",
    "tags": []
  },
  {
    "category": "Triangle face",
    "label": "TriangleFace2",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/528/18765180-c254-4411-a25c-c1d78f5c3d77.jpg",
    "tags": []
  }
]
```

* `eyebrows`


```json
{
  "category": "eyebrows",              // string, const "eyebrows"
  "pattern": {
    "type": "shape",                   // string, enum ["shape","color"], default: "shape"
    "name": "",                        // string, required when type="shape" — label from eyebrows.json
    "curvature": 0,                    // integer, range: -100..100 (shape only)
    "thickness": 0,                    // integer, range: -100..100 (shape only)
    "definition": 0                    // integer, range: 0..100 (shape only)
  },
  "palettes": [
    {
      "color": "#ff0000",              // string, hex color "#RRGGBB"
      "colorIntensity": 50,            // integer, range: 0..100
      "texture": "matte",              // string, enum ["matte","shimmer"]
      "shimmerColor": "#fc288f",       // string, hex color "#RRGGBB" — REQUIRED if texture="shimmer"
      "shimmerIntensity": 50,          // integer, range: 0..100 — REQUIRED if texture="shimmer"
      "shimmerSize": 50,               // integer, range: 0..100 — REQUIRED if texture="shimmer"
      "shimmerDensity": 50             // integer, range: 0..100 — REQUIRED if texture="shimmer"
    }
  ]
}
```

**Full Pattern Catalog:**
https://plugins-media.makeupar.com/wcm-saas/patterns/eyebrows.json

**Distinct Makeup Pattern Categories:**

```json
[
  {
    "category": "Arrow",
    "label": "Arrow1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/490/1fb96bf9-979e-4327-a8c4-8c503f541f1a.jpg",
    "tags": []
  },
  {
    "category": "Curved",
    "label": "Curved1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/389/1ccb300e-c7ed-4995-920e-7d1bf8da1fad.jpg",
    "tags": []
  },
  {
    "category": "Drama",
    "label": "Drama2",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/196/5fb14bec-553d-4841-bba7-ca7e5e27c12e.jpg",
    "tags": []
  },
  {
    "category": "High Arch",
    "label": "HighArch1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/609/7a8676dc-6f6a-4b12-aab0-c50328e448c5.jpg",
    "tags": []
  },
  {
    "category": "Original",
    "label": "Original2",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/300/123551e9-ca94-4732-89ed-5b3866678555.jpg",
    "tags": []
  },
  {
    "category": "Soft Arch",
    "label": "SoftArch1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/121/2552ebf0-2705-43f7-b295-4fac21e18009.jpg",
    "tags": []
  },
  {
    "category": "Straight",
    "label": "Straight1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/1/7734e777-8e51-41f1-abaf-205f0ed5e3b4.jpg",
    "tags": []
  },
  {
    "category": "Thin",
    "label": "Thin1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/734/6ee10843-a251-4aa0-9183-db7f981d714d.jpg",
    "tags": []
  },
  {
    "category": "Upward",
    "label": "Upward4",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/751/76578317-f475-49c7-bd96-910ccad617ef.jpg",
    "tags": []
  }
]
```

* `eye_liner`


```json
{
  "category": "eye_liner",             // string, const "eye_liner"
  "pattern": { "name": "" },           // object — name MUST equal a label from eyeliner.json
  "palettes": [
    {
      "color": "#ff0000",              // string, hex color "#RRGGBB"
      "texture": "matte",              // string, enum ["matte","shimmer","metallic"]
      "shimmerColor": "#fc288f",       // string, hex color "#RRGGBB" — REQUIRED if texture in ["shimmer","metallic"]
      "shimmerIntensity": 50,          // integer, range: 0..100 — REQUIRED if texture in ["shimmer","metallic"]
      "metallicIntensity": 50,         // integer, range: 0..100 — REQUIRED if texture="metallic"
      "colorIntensity": 50             // integer, range: 0..100
    }
  ]
}
```

**Full Pattern Catalog:**
https://plugins-media.makeupar.com/wcm-saas/patterns/eyeliner.json

**Distinct Makeup Pattern Categories:**

```json
[
  {
    "category": "2 colors",
    "label": "2colors1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/419/71d9429a-dc08-4e80-9c46-6e55631ef766.jpg",
    "tags": [
      {
        "id": 28,
        "name": "Drama"
      }
    ],
    "colorNum": 2
  },
  {
    "category": "3 colors",
    "label": "3colors2",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/208/056aa6cd-8678-470c-b111-b7653d7ddf93.jpg",
    "tags": [
      {
        "id": 28,
        "name": "Drama"
      }
    ],
    "colorNum": 3
  },
  {
    "category": "1 color",
    "label": "Arabic3",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/726/1919aad4-21a2-493a-a5f8-48bc99a61ba5.jpg",
    "tags": [
      {
        "id": 26,
        "name": "Arabic"
      }
    ],
    "colorNum": 1
  }
]
```

* `eye_shadow`


```json
{
  "category": "eye_shadow",            // string, const "eye_shadow"
  "pattern": { "name": "" },           // object — name MUST equal a label from eyeshadow.json
  "palettes": [
    {
      "color": "#ff0000",              // string, hex color "#RRGGBB"
      "texture": "matte",              // string, enum ["matte","shimmer","metallic"]
      "shimmerColor": "#fc288f",       // string, hex color "#RRGGBB" — REQUIRED if texture in ["shimmer","metallic"]
      "shimmerIntensity": 50,          // integer, range: 0..100 — REQUIRED if texture in ["shimmer","metallic"]
      "metallicIntensity": 50,         // integer, range: 0..100 — REQUIRED if texture="metallic"
      "colorIntensity": 50             // integer, range: 0..100
    }
  ]                                    // minItems: (see colorNum in pattern)
}
```

**Full Pattern Catalog:**
https://plugins-media.makeupar.com/wcm-saas/patterns/eyeshadow.json

**Distinct Makeup Pattern Categories:**

```json
[
  {
    "category": "1 color",
    "label": "1color1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/188/0322c4f9-e54d-4a6b-8072-6bb76560121a.jpg",
    "tags": [
      {
        "id": 12,
        "name": "Artistic"
      },
      {
        "id": 14,
        "name": "Dream"
      },
      {
        "id": 15,
        "name": "Trend"
      }
    ],
    "colorNum": 1
  },
  {
    "category": "2 colors",
    "label": "2colors1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/938/3348211c-1b83-4ab2-9c6a-ce06e4aa3528.jpg",
    "tags": [
      {
        "id": 1,
        "name": "Fan shape"
      },
      {
        "id": 8,
        "name": "Only upper lid"
      }
    ],
    "colorNum": 2
  },
  {
    "category": "3 colors",
    "label": "3colors1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/542/55e1b0fd-b888-47ff-bd3a-3dc1af2a7b69.jpg",
    "tags": [
      {
        "id": 1,
        "name": "Fan shape"
      },
      {
        "id": 8,
        "name": "Only upper lid"
      }
    ],
    "colorNum": 3
  },
  {
    "category": "4 colors",
    "label": "4colors1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/429/29cd5839-464b-4a7a-a5c1-c7b40e9464d7.jpg",
    "tags": [
      {
        "id": 4,
        "name": "Closed banana"
      },
      {
        "id": 10,
        "name": "Whole eye"
      }
    ],
    "colorNum": 4
  },
  {
    "category": "5 colors",
    "label": "5colors1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/2/824dcf7c-1273-4a30-8f1f-2137926057d6.jpg",
    "tags": [
      {
        "id": 4,
        "name": "Closed banana"
      },
      {
        "id": 10,
        "name": "Whole eye"
      }
    ],
    "colorNum": 5
  }
]
```

* `eyelashes`


```json
{
  "category": "eyelashes",             // string, const "eyelashes"
  "pattern": { "name": "" },           // object — name MUST equal a label from eyelashes.json
  "palettes": [
    { "color": "#ff0000", "colorIntensity": 50 }  // hex color, int range: 0..100
  ]
}
```

**Full Pattern Catalog:**
https://plugins-media.makeupar.com/wcm-saas/patterns/eyelashes.json

**Distinct Makeup Pattern Categories:**

```json
[
  {
    "category": "Artistic",
    "label": "Artistic1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/146/7a8ed606-1c27-4d91-9320-c40a904f621f.jpg",
    "tags": []
  },
  {
    "category": "Natural",
    "label": "Natural1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/287/cd5cae75-a1b3-48f8-8537-e6e259213901.png",
    "tags": []
  },
  {
    "category": "Upper&Lower",
    "label": "Upper&Lower1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/18/2689ea2d-725e-4fa0-8563-df874ae1a83f.jpg",
    "tags": []
  },
  {
    "category": "Upper",
    "label": "Upper1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/982/c99bf74e-545f-4da7-a314-f3bd84b82156.jpg",
    "tags": []
  },
  {
    "category": "UpperDense",
    "label": "UpperDense1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/888/452ec863-f0a8-40e7-aa33-31c0c39f57e2.jpg",
    "tags": []
  },
  {
    "category": "Winged",
    "label": "Winged1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/825/36ab3859-eae5-49e4-9d97-161698bbb8bb.jpg",
    "tags": []
  },
  {
    "category": "Wispies",
    "label": "Wispies1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/722/a2a727f6-748c-41e7-8ac0-c9c57c18c05a.png",
    "tags": []
  }
]
```

* `foundation`


```json
{
  "category": "foundation",            // string, const "foundation"
  "palettes": [
    {
      "color": "#ff0000",              // string, hex color "#RRGGBB"
      "colorIntensity": 50,            // integer, range: 0..100
      "glowIntensity": 50,             // integer, range: 0..100
      "coverageIntensity": 50          // integer, range: 0..100
    }
  ]
}
```

* `highlighter`


```json
{
  "category": "highlighter",           // string, const "highlighter"
  "pattern": { "name": "" },           // object — name MUST equal a label from highlighter.json
  "palettes": [
    {
      "color": "#ff0000",              // string, hex color "#RRGGBB"
      "glowIntensity": 50,             // integer, range: 0..100
      "shimmerIntensity": 50,          // integer, range: 0..100
      "shimmerDensity": 50,            // integer, range: 0..100
      "shimmerSize": 50,               // integer, range: 0..100
      "colorIntensity": 50             // integer, range: 0..100
    }
  ]
}
```

**Full Pattern Catalog:**
https://plugins-media.makeupar.com/wcm-saas/patterns/highlighter.json

**Distinct Makeup Pattern Categories:**

```json
[
  {
    "category": "Heart face",
    "label": "HeartFace4",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/246/6ca40279-79cc-4918-b48a-64306009b365.jpg",
    "tags": []
  },
  {
    "category": "Invtriangle",
    "label": "Invtriangle2",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/7/6b0b9760-612c-4319-bd81-855d262d8e89.jpg",
    "tags": []
  },
  {
    "category": "Oblong",
    "label": "Oblong11",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/862/b7279f4e-edf2-43f3-8156-561fe5a52ec3.jpg",
    "tags": []
  },
  {
    "category": "Oval face",
    "label": "OvalFace2",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/369/91097a05-9fd2-43cb-82e9-dd45e72b613b.jpg",
    "tags": []
  },
  {
    "category": "Round face",
    "label": "RoundFace3",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/520/2d3ccbe2-36c3-43df-9e78-4c2c931fa431.jpg",
    "tags": []
  },
  {
    "category": "Square face",
    "label": "SquareFace3",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/989/2959777b-19ca-4f4a-a023-3c8927191497.jpg",
    "tags": []
  },
  {
    "category": "Triangle face",
    "label": "TriangleFace3",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/customer/guest/SkuCustomImage/765/221c1f12-c621-4567-a8ee-1433038ee8a2.jpg",
    "tags": []
  }
]
```

* `lip_color`


```json
{
  "category": "lip_color",             // string, const "lip_color"
  "shape": {                           // object — driven by lipshape.json
    "name": "original"                 // string — MUST equal a `label` from lipshape.json
  },
  "morphology": {                      // optional object
    "fullness": 50,                    // integer, range: 0..100 (default: 0)
    "wrinkless": 50                    // integer, range: 0..100 (default: 0)
  },
  "palettes": [                        // minItems depends on style; often ≥1
    {
      "color": "#ff0000",              // string, hex color "#RRGGBB"
      "texture": "matte",              // string, enum ["matte","gloss","holographic","metallic","satin","sheer","shimmer"]
      "colorIntensity": 50,            // integer, range: 0..100
      "gloss": 50,                     // int, range: 0..100 — REQUIRED if texture in ["gloss","holographic","metallic","sheer","shimmer"]
      "shimmerColor": "#ff0000",       // string, hex color "#RRGGBB" — REQUIRED if texture in ["holographic","metallic","shimmer"]
      "shimmerIntensity": 50,          // integer, range: 0..100 — REQUIRED if texture in ["holographic","metallic","shimmer"]
      "shimmerDensity": 50,            // integer, range: 0..100 — REQUIRED if texture in ["holographic","metallic","shimmer"]
      "shimmerSize": 50,               // integer, range: 0..100 — REQUIRED if texture in ["holographic","metallic","shimmer"]
      "transparencyIntensity": 50      // integer, range: 0..100 — REQUIRED if texture in ["gloss","sheer","shimmer"]
    }
  ],
  "style": {
    "type": "full",                    // string, enum ["full","ombre","twoTone"]
    "innerRatio": 50,                  // int, range: 0..100 — REQUIRED if type="ombre"
    "featherStrength": 50              // int, range: 0..100 — REQUIRED if type="ombre"
  }
}
```

**Full Pattern Catalog:**
https://plugins-media.makeupar.com/wcm-saas/shapes/lipshape.json

**Distinct Makeup Pattern Categories:**

```json
[{
        "category": "general",
        "label": "original",
        "thumbnail": "https://plugins-media.makeupar.com/wcm-saas/images/lipshapes/original.png",
        "tags": [
        ]
    }, {
        "category": "general",
        "label": "heart-shaped",
        "thumbnail": "https://plugins-media.makeupar.com/wcm-saas/images/lipshapes/heart-shaped.jpg",
        "tags": [
        ]
    }, {
        "category": "general",
        "label": "m-shaped",
        "thumbnail": "https://plugins-media.makeupar.com/wcm-saas/images/lipshapes/m-shaped.jpg",
        "tags": [
        ]
    }, {
        "category": "general",
        "label": "petal",
        "thumbnail": "https://plugins-media.makeupar.com/wcm-saas/images/lipshapes/petal.jpg",
        "tags": [
        ]
    }, {
        "category": "general",
        "label": "plump",
        "thumbnail": "https://plugins-media.makeupar.com/wcm-saas/images/lipshapes/plump.jpg",
        "tags": [
        ]
    }, {
        "category": "general",
        "label": "pouty",
        "thumbnail": "https://plugins-media.makeupar.com/wcm-saas/images/lipshapes/pouty.jpg",
        "tags": [
        ]
    }, {
        "category": "general",
        "label": "smile",
        "thumbnail": "https://plugins-media.makeupar.com/wcm-saas/images/lipshapes/smile.jpg",
        "tags": [
        ]
    }, {
        "category": "general",
        "label": "vintage",
        "thumbnail": "https://plugins-media.makeupar.com/wcm-saas/images/lipshapes/vintage.jpg",
        "tags": [
        ]
    }
]
```

* `lip_liner`


```json
{
  "category": "lip_liner",             // string, const "lip_liner"
  "pattern": { "name": "" },           // object — name MUST equal a label from lipliner.json
  "palettes": [
    {
      "color": "#ff0000",              // string, hex color "#RRGGBB"
      "texture": "matte",              // string, enum ["matte","satin"]
      "colorIntensity": 50,            // integer, range: 0..100
      "thickness": 50,                 // integer, range: 0..100
      "smoothness": 50                 // integer, range: 0..100
    }
  ]
}
```

**Full Pattern Catalog:**
https://plugins-media.makeupar.com/wcm-saas/patterns/lipliner.json

**Distinct Makeup Pattern Categories:**

```json
[
  {
    "category": "Large & Full",
    "label": "Large&Full1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/417/7ac66cb2-2c7b-451c-8284-cc77791b7001.jpg",
    "tags": []
  },
  {
    "category": "Larger Lower",
    "label": "LargerLower1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/878/84b2ef48-3af4-4851-86d2-b01d10db82b2.jpg",
    "tags": []
  },
  {
    "category": "Larger Upper",
    "label": "LargerUpper1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/867/674f9f4c-7961-462e-8cc9-9a8acaad4168.jpg",
    "tags": []
  },
  {
    "category": "Natural",
    "label": "Natural1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/258/7533c08a-cc9c-45ab-9294-5d5a8114037d.jpg",
    "tags": []
  },
  {
    "category": "Rosebud",
    "label": "Rosebud1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/47/eb95e91f-6ef1-41f7-bc4f-aecd7d780c42.jpg",
    "tags": []
  },
  {
    "category": "Small",
    "label": "Small1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/396/6b78e461-24a6-4c6d-afb4-88beb71f1732.jpg",
    "tags": []
  },
  {
    "category": "Wider",
    "label": "Wider1",
    "thumbnail": "https://app-cdn-01.makeupar.com/console/SkuCustomImage/guest/867/21f92b70-72b5-4a57-b4d7-81c5cce757a6.jpg",
    "tags": []
  }
]
```

## Example Payload

Here is a full example of a valid `effectJson` payload applying multiple effects.

```json
{
  "version": "1.0",
  "effects": [
    {
      "category": "skin_smooth",
      "skinSmoothStrength": 55,
      "skinSmoothColorIntensity": 45
    },
    {
      "category": "blush",
      "pattern": { "name": "2colors1" },
      "palettes": [
        {
          "color": "#e19f9f",
          "texture": "matte",
          "colorIntensity": 60,
          "shimmerColor": "#d63252",
          "shimmerDensity": 50
        },
        {
          "color": "#c98a8a",
          "texture": "satin",
          "glowStrength": 40,
          "colorIntensity": 70
        }
      ]
    },
    {
        "category": "lip_color",
        "shape": { "name": "plump" },
        "morphology": { "fullness": 30, "wrinkless": 25 },
        "style": { "type": "full" },
        "palettes": [
            {
                "color": "#e11c43",
                "texture": "gloss",
                "colorIntensity": 80,
                "gloss": 75
            }
        ]
    }
  ]
}
```

In this example, `blush` uses the the `2colors1` pattern from the `blush.json`, which requires exactly two palettes. The `lip_color` effect uses the the `plump` shape from `lipshape.json`.

## File Specs & Errors

* Supported Formats & Dimensions


| AI Feature | Supported Dimensions | Supported File Size | Supported Formats |
|  --- | --- | --- | --- |
| AI Makeup Virtual Try-On | long side < 1920, face width >= 100 | < 10MB | jpg/jpeg/png |


* Error Codes


| Error Code | Description |
|  --- | --- |
| error_below_min_image_size | the size of the source image is smaller than minimum (expect: width >= 100px, height >= 100px) |
| error_exceed_max_image_size | the size of the source image is larger than maximum (expect: width < 1920px, height < 1080px) |
| error_face_position_invalid | Please ensure your entire face is fully visible within the image |
| error_face_position_too_small | The detected face is too small. Move closer to the camera |
| error_face_position_out_of_boundary | The face is too large or partially outside the image frame. Adjust your position |
| error_face_angle_invalid | The face angle is incorrect. For front-facing photos, keep your head within 10°. For side-facing photos, ensure more than 15°. |


* Environment & Dependency


| Sample Code Language / Tool | Recommended Runtime Versions |
|  --- | --- |
| cURL | - bash >= 3.2   - curl >= 7.58 (modern TLS/HTTP support)   - jq >= 1.6 (robust JSON parsing) |
| Node.js (JavaScript) | Node >= 18 (for global fetch) |
| JavaScript | - Chrome / Edge >= 80   - Firefox >= 74   - Safari >= 13.1 |
| PHP | PHP >= 7.4 (for modern TLS/compat), ext-curl (recommended) or allow_url_fopen=On + ext-openssl, ext-json |
| Python | Python >= 3.10 (for f-strings), requests >= 2.20.0 |
| Java | Java 11+ (for HttpClient), Jackson Databind >= 2.12.0 |


## JS Camera Kit

# JavaScript Camera Kit SDK Documentation

```
version: v2.5
```

## Overview

The **JavaScript Camera Kit** provides a complete in-browser camera solution designed for high-accuracy face-based imaging tasks. It handles camera permissions, real-time face detection, automatic quality validation (lighting, pose, angle, distance), and guided capture UI flows.

This module is optimized for **AI-driven image analysis**, such as:

* AI Skin Analysis (SD/HD)
* AI Face Tone Analysis
* Hair-related Analysis
* Virtual Try-On (Ring, Wrist, Necklace, etc.)


### Key Features

* **Permission Handling:** Automatic management of webcam access.
* **Quality Validation:** Real-time monitoring of face position, lighting, and angle.
* **Multi-Step Flows:** Support for complex capture requirements (e.g., multi-angle hair capture).
* **Flexible Output:** Supports both `base64` and `blob` image formats.


## Installation

Include the SDK via CDN in your HTML `<head>` or before the closing `<body>` tag. Once loaded, the SDK installs a global `YMK` object.

```html
<script src="https://plugins-media.makeupar.com/v2.5-camera-kit/sdk.js"></script>
```

## Quick Start Example

The following example demonstrates how to initialize the kit, open the camera, and handle captured images.

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Camera Kit Sample</title>
    <style>
      #YMK-module { margin: 20px 0; }
      img { width: 150px; margin: 5px; border: 1px solid #ccc; }
    </style>
  </head>
  <body>

    <!-- Initialization Script -->
    <script>
      // Define async init entry point
      window.YMKAsyncInit = function() {
        YMK.addEventListener('loaded', function() {
          console.log('Module fully loaded and ready');
        });

        YMK.addEventListener('faceDetectionCaptured', function(capturedResult) {
          const container = document.getElementById('captured-results');
          container.innerHTML = '';

          // Handle multiple images if returned (e.g., multi-angle capture)
          for (const item of capturedResult.images) {
            const img = document.createElement('img');
            // Handle both base64 strings and Blob objects
            img.src = typeof item.image === 'string' 
              ? item.image 
              : URL.createObjectURL(item.image);
            container.appendChild(img);
          }
        });
      };

      function openCameraKit() {
        YMK.init({
          faceDetectionMode: 'makeup',
          imageFormat: 'base64',
          language: 'enu'
        });
        YMK.openCameraKit();
      }
    </script>

    <!-- Load SDK -->
    <script src="https://plugins-media.makeupar.com/v2.5-camera-kit/sdk.js"></script>

    <!-- UI Elements -->
    <button onclick="openCameraKit()">Open Camera Kit</button>

    <!-- Mandatory Mount Point -->
    <div id="YMK-module"></div>

    <h3>Captured Results:</h3>
    <div id="captured-results"></div>
  </body>
</html>
```

## Prerequisites

To ensure successful integration, the following requirements must be met:

| Requirement | Description |
|  --- | --- |
| **Browser Support** | Must support `getUserMedia` API. |
| **HTTPS** | Required on most browsers for webcam access (except localhost). |
| **Mount Point** | A `<div id="YMK-module"></div>` is mandatory for rendering the UI. |
| **Async Init** | You must define `window.YMKAsyncInit` before the SDK loads. |


## Integration Guide

### Step 1: Initialize the Module

Call `YMK.init()` before calling `YMK.openCameraKit()`.

```javascript
YMK.init({
  faceDetectionMode: 'makeup', // Detection flow
  imageFormat: 'base64',       // Output format
  language: 'enu'              // UI Language
});
```

### Step 2: Add Event Handlers

Register listeners for camera events and capture results.

```javascript
YMK.addEventListener('faceQualityChanged', function(q) {
  console.log('Quality updated:', q);
});
```

### Step 3: Open Camera Kit

This displays the UI, opens the webcam, and begins real-time monitoring.

```javascript
YMK.openCameraKit();
```

### Step 4: Receive Captured Results

Images arrive via the `faceDetectionCaptured` event.

```javascript
YMK.addEventListener('faceDetectionCaptured', function(result) {
  console.log(result.images);
});
```

### Step 5: Close Module

Clean up resources when done.

```javascript
YMK.close();
```

## API Reference

### `YMK.init(args)`

Configures module appearance, detection mode, language, and capture format.

| Argument | Type | Description | Default |
|  --- | --- | --- | --- |
| `faceDetectionMode` | `string` | Detection flow to use (see [Detection Modes](#section/Detection-Modes) below). | `"skincare"` |
| `width` | `number` | Pixel width of module container (`300–1920`). | `360` (≥500px) or `screen width` |
| `height` | `number` | Pixel height of module container (`300–1920`). | `480` (≥500px) or `min(screen.height, innerHeight)` |
| `language` | `string` | UI Language code (`chs`, `cht`, `deu`, `enu`, `esp`, `fra`, `jpn`, `kor`, `ptb`, `ita`, `mon `). | `"enu"` |
| `imageFormat` | `string` | Format returned via `faceDetectionCaptured`. | `"base64"` |
| `disableCameraResolutionCheck` | `boolean` | Allow running even if webcam does not meet required resolution. | `false` |
| `hideFlipCameraButton` | `boolean` | Controls visibility of the flip front/back camera button if the device supports it. | `false` |
| `countingDuration` | `number` | Controls the countdown milliseconds when camera quality check meets criteria before auto-capture. | `800` |
| `qualityLevel` | `string` | Controls the camera quality check setting, with options of  `relaxed`, `moderate`, or `strict`. | `relaxed` |
| `qualityOverrides` | `object` | Configure detailed parameters for camera quality verification. | See [Camera Kit Quality Configuration](#section/Camera-Kit-Quality-Configuration) |
| `videoQuality` | `string` | Configure the output quality to `720p`, `1080p`, or `1920p`. 720p corresponds to 1280 × 720, 1080p to 1920 × 1080, and 1920p to 2560 × 1920. This setting is supported only for `skincare` and `hdskincare` | `720p` |


### Methods

| Method | Description |
|  --- | --- |
| `YMK.openCameraKit()` | Opens the module and begins detection. |
| `YMK.close()` | Closes module and camera. |
| `YMK.addEventListener(event, callback)` | Registers event callbacks. Returns an `EventListenerIdentifier`. |
| `YMK.removeEventListener(id)` | Removes listener by identifier. |
| `YMK.isLoaded()` | Returns whether livestream or photo is drawn on canvas (`boolean`). |
| `YMK.pause()` | Pauses the webcam stream. |
| `YMK.resume(restartWebcam)` | Resumes webcam after pause. |
| `YMK.getInfo()` | Returns current module info (e.g., `{ fps: 30 }`). |


### Camera Kit Quality Configuration

Camera Kit provides configurable quality parameters to control face detection and skin analysis behavior. These parameters allow developers to fine-tune detection strictness while maintaining consistency across web and native SDK implementations.

To simplify configuration, Camera Kit includes three predefined presets:

* **RELAXED**: Optimized for usability with minimal restrictions
* **MODERATE**: Balanced between usability and accuracy
* **STRICT**: Optimized for maximum detection accuracy


All custom configurations must meet or exceed the minimum requirements defined by the **RELAXED** preset.

Camera Kit Quality Configuration supports both `skincare` and `hdskincare`.

### Preset Behavior

| Preset | Description |
|  --- | --- |
| RELAXED | Less strict validation for smoother user experience |
| MODERATE | Balanced validation for most use cases |
| STRICT | Tight validation for high accuracy scenarios |


When using `qualityOverrides`, you may specify only the parameters you want to change. Unspecified parameters fall back to the active preset defaults.

### Configuration Object

```json
{
  "face_ratio_lower_threshold": 0.55,
  "face_ratio_upper_threshold": 1,
  "face_left_boundary_lower_threshold": 0,
  "face_left_boundary_upper_threshold": 1,
  "face_right_boundary_lower_threshold": 0,
  "face_right_boundary_upper_threshold": 1,
  "face_top_boundary_lower_threshold": 0,
  "face_top_boundary_upper_threshold": 1,
  "face_bottom_boundary_lower_threshold": 0,
  "face_bottom_boundary_upper_threshold": 1,
  "pitch_lower_threshold": -20,
  "pitch_upper_threshold": 10,
  "yaw_lower_threshold": -15,
  "yaw_upper_threshold": 15,
  "roll_lower_threshold": -15,
  "roll_upper_threshold": 15,
  "lighting_lower_threshold": 0.55,
  "lighting_upper_threshold": 0.8,
  "lighting_uneven_threshold": 0.2
}
```

### Parameters

#### Face Ratio Control

Controls the acceptable proportion of the detected face.

* Measurement basis:
  * Landscape mode: vertical ratio
  * Portrait mode: horizontal ratio


| Parameter | Description | Allowed Range | Preset Defaults |
|  --- | --- | --- | --- |
| `face_ratio_lower_threshold` | Minimum face ratio | 0.55 to 1.0 | STRICT 0.75, MODERATE 0.65, RELAXED 0.55 |
| `face_ratio_upper_threshold` | Maximum face ratio | 1.0 | 1.0 (all presets) |


#### Face Boundary Control

Defines how close the face can be to the frame edges.

| Parameter | Description | Allowed Range | Default |
|  --- | --- | --- | --- |
| `face_left_boundary_lower_threshold` | Left boundary minimum | 0.0 to 1.0 | 0.0 |
| `face_left_boundary_upper_threshold` | Left boundary maximum | 0.0 to 1.0 | 1.0 |
| `face_right_boundary_lower_threshold` | Right boundary minimum | 0.0 to 1.0 | 0.0 |
| `face_right_boundary_upper_threshold` | Right boundary maximum | 0.0 to 1.0 | 1.0 |
| `face_top_boundary_lower_threshold` | Top boundary minimum | 0.0 to 1.0 | 0.0 |
| `face_top_boundary_upper_threshold` | Top boundary maximum | 0.0 to 1.0 | 1.0 |
| `face_bottom_boundary_lower_threshold` | Bottom boundary minimum | 0.0 to 1.0 | 0.0 |
| `face_bottom_boundary_upper_threshold` | Bottom boundary maximum | 0.0 to 1.0 | 1.0 |


#### Head Pose Angle Control

Controls allowable head orientation.

| Parameter | Description | Allowed Range | Preset Defaults |
|  --- | --- | --- | --- |
| `pitch_lower_threshold` | Minimum pitch angle | -20 to 10 | STRICT -10, MODERATE -15, RELAXED -20 |
| `pitch_upper_threshold` | Maximum pitch angle | -20 to 10 | STRICT 0, MODERATE 5, RELAXED 10 |
| `yaw_lower_threshold` | Minimum yaw angle | -15 to 15 | STRICT -5, MODERATE -10, RELAXED -15 |
| `yaw_upper_threshold` | Maximum yaw angle | -15 to 15 | STRICT 5, MODERATE 10, RELAXED 15 |
| `roll_lower_threshold` | Minimum roll angle | -15 to 15 | STRICT -5, MODERATE -10, RELAXED -15 |
| `roll_upper_threshold` | Maximum roll angle | -15 to 15 | STRICT 5, MODERATE 10, RELAXED 15 |


#### Lighting Control

Defines acceptable lighting quality and uniformity.

| Parameter | Description | Allowed Range | Preset Defaults |
|  --- | --- | --- | --- |
| `lighting_lower_threshold` | Minimum lighting level | 0.55 to 1.0 | STRICT 0.8, MODERATE 0.7, RELAXED 0.55 |
| `lighting_upper_threshold` | Maximum lighting level | 0.8 to 1.0 | STRICT 0.9, MODERATE 0.85, RELAXED 0.8 |
| `lighting_uneven_threshold` | Maximum luma difference between eyes | 0.0 to 0.2 | STRICT 0.1, MODERATE 0.15, RELAXED 0.2 |


### Validation Rules

* Custom values must not be less restrictive than RELAXED preset values.
* Only specified fields in `qualityOverrides` are applied.
* All unspecified parameters default to the selected preset.


## Detection Modes

Configure the `faceDetectionMode` in `YMK.init()` to suit your specific use case.

| Mode | Description |
|  --- | --- |
| `makeup` | Standard camera mode for virtual cosmetic try-on. |
| `skincare` | Standard skin analysis mode, close-up face capture. Support AI Skin Analysis and AI Skin Simulation. |
| `hdskincare` | High-definition capture for AI skin analysis using webcams with a minimum resolution of 2560 pixels on the longer side, subject to device support. |
| `shadefinder` | Skin Tone Analysis front-face capture. |
| `facereshape` | AI Face Reshape capture and AI Face Lift. |
| `hairlength` | Full hair-length capture (from a distance). |
| `hairfrizziness` | 3-phase capture: front, right-turn, left-turn. |
| `hairtype` | Same 3-phase multi-angle capture flow. |
| `hairdensity` | A 45‑degree downward head‑angle photograph. |
| `ring` | Hand capture for ring virtual try‑on. |
| `wrist` | Wrist capture for watch or bracelet virtual try‑on. |
| `necklace` | Selfie capture for necklace try-on. |
| `earring` | Selfie capture for earring virtual try-on. |
| `teethwhiten` | Front‑facing selfie that detects whether teeth are visible; photo taken only when detected. |
| `nail` | Hand capture for nails virtual try‑on. |
| `comprehensive` | Photo to be used simultaneously for AI Makeup, AI Skin Analysis, and AI Facial Attributes & Ratio Analysis. |


## Events Reference

### Lifecycle & Status Events

| Event | Description |
|  --- | --- |
| `opened` | Module opened. |
| `loading` | Loading progress (0–100). |
| `loaded` | Camera stream loaded onto canvas. |
| `closed` | Module closed. |
| `faceDetectionStarted` | User enters the detection UI. |


### Camera Events

| Event | Description |
|  --- | --- |
| `cameraOpened` | Webcam opened successfully. |
| `cameraClosed` | Webcam closed. |
| `cameraFailed` | Permission denied or no webcam found. Error codes include `"error_resolution_unsupported"`, `"error_permission_denied"`, `"error_access_failed"`. |
| `unsupportedResolution` | Fired when the device resolution does not meet the minimum requirements for the selected mode. |


### Detection Events

#### `faceQualityChanged`

Fires continuously during detection as quality metrics update.

**Example Payload:**

```json
{
  "hasFace": true,
  "position": "good",
  "frontal": "good",
  "lighting": "ok"
}
```

**Field Definitions:**

* `hasFace`: (`boolean`) Whether a face is detected.
* `position`: (`string`) Face distance/size quality (`"good"`, `"notgood"`, `"toosmall"`, `"outofboundary"`).
* `frontal`: (`string`) Whether user is facing forward (`"good"`, `"notgood"`).
* `lighting`: (`string`) Lighting strength (`"good"`, `"ok"`, `"notgood"`).


#### `faceDetectionCaptured`

Fired **after** all required face quality validation checks have passed and the Camera Kit has successfully completed the capture workflow. Depending on the mode, this may contain one or multiple images.

**Example Payload:**

```json
{
  "mode": "makeup",
  "images": [
    {
      "phase": 0,
      "image": "data:image/jpeg;base64,...",
      "width": 500,
      "height": 500
    }
  ]
}
```

**Image Object Fields:**

* `phase`: (`integer`) Zero-based index representing the capture step.
* `image`: (`string` | `Blob`) The captured image data.
* `width`: (`integer`) Pixel width of the captured image.
* `height`: (`integer`) Pixel height of the captured image.


## Configuration Notes

### Quality Requirements

To ensure successful capture:

1. **Distance:** Ensure correct face distance (not too zoomed in/out).
2. **Angle:** Ensure frontal face angle.
3. **Lighting:** Provide sufficient lighting (avoid shadows or dark environments).


### Multi-Phase Capture

Modes like `hairtype` or `hairfrizziness` require multiple steps:

1. Front face
2. Turn right
3. Turn left


Ensure your event handling logic accounts for multiple images in the `faceDetectionCaptured` result array.

### Advanced Configuration

* **Flip Button:** Use `hideFlipCameraButton: true` to enforce a specific camera orientation if your UX requires it.
* **Capture Delay:** Adjust `countingDuration` (default `800`) to give users more time to review the capture before auto-submission occurs.


### Minimum Recommended Quality

```javascript
const minQuality = {
  hasFace: true,
  area: "good",
  frontal: "good",
  lighting: "ok"
};
```

## Unit Consumption

| AI Feature | Unit Consumed |
|  --- | --- |
| AI Makeup Virtual Try-On V1.0 | 1 |