# FAQ

1. **Q: What does 'Unit' mean, and how is it used?**
**A:** Please note that Units is the currency used for YouCam API operations; different AI features deduct different amounts of units. In this document, the code name used for a Unit is "Credit."
2. **Q: Why am I getting InvalidTaskId error?**
**A:** You will get a ***InvalidTaskId*** error once you check the status of a timed out task. So, once you run an AI task, you need to **polling** to check the status within the ***polling_interval*** until the status become either *success* or *error*.
3. **Q: How to authenticate?**
**A:** Your API Key is the ***Bearer Token*** to complete the authentication process. Include your API key in the request header using **Bearer Token**:

```
Authorization: Bearer YOUR_API_KEY
```
For more information and questions, please refer to our [blog page](https://www.makeupar.com/consumer/blog) and the [API playground](https://yce.makeupar.com/api-console/en/api-playground/ai-skin-analysis/). Or send an e-mail to [YouCamOnlineEditor_API@perfectcorp.com](mailto:YouCamOnlineEditor_API@perfectcorp.com). Our customer success team are very happy to help. ;)
4. **Q: How to uplaod an image through curl?**
**A:** curl --location --request PUT '{url_api_response}' --header '{headers_in_api_response}' --data-binary @'{local_file_path}'

```
curl --location --request PUT 'https://example.com/sample-result-url' --header 'Content-Type: image/jpg' --header 'Content-Length: 50000'  --data-binary @'./test.jpg'
```

5. **Q: What platforms does the AI API support? Can it be used on mobile devices?**
**A:** The AI API works seamlessly across different platforms. Since it's built on a standard RESTful API, you can use it for server-to-server communication, on mobile devices, or in a web browser - whatever best fits your needs.
6. **Q: Is it possible to use the AI API with Flutter on both Android and iOS?**
**A:**
Absolutely. Since AI APIs are standard RESTful APIs, you can access them using Flutter's built-in HTTP APIs to make requests.
Here are some official Flutter documents on making network queries.
  * https://docs.flutter.dev/cookbook/networking/fetch-data
  * https://pub.dev/packages/http
And here’s a simple way to call a http GET with Bearer Authentication using Flutter’s http package:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<void> fetchData() async {
    String token = "your_bearer_token_here"; // Replace with your actual token

    final response = await http.get(
        Uri.parse("https://yce-api-01.makeupar.com/s2s/v2.0/task/ai-task"), // Replace the `ai-task` with the AI feature you intend to use.
        headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer $token",
        },
    );

    if (response.statusCode == 200) {
        print("Data fetched successfully: ${response.body}");
    } else {
        print("Failed to fetch data: ${response.statusCode}");
    }
}
```
Key Steps to Auth:
  - Retrieve the Token – You can store and retrieve the token using SharedPreferences or another secure storage method.
  - Include the Token in Headers – Use "Authorization": "Bearer $token" in the request headers.
  - Handle Expired Tokens – If the API returns a 401 InvalidAccessToken error, refresh the token if needed.
7. **Q: API key is the API key,  Where can I find the secret key?**
**A:** The secret key is created only when you first generate it. So make sure to save it right away, you won't be able to see it again later.
8. **Q: Is it possible to integrate AI APIs into your website using Wix?**
**A:** We do not currently have an official integration guide for using AI APIs with Wix. However, the RESTful API itself does not impose any restrictions on the platform, provided it supports standard web queries.
We strongly recommend to begin by reading the official documentation provided by Wix: https://dev.wix.com/docs/develop-websites/articles/get-started/integrate-with-3rd-parties
Wix offers several methods for integrating with third-party APIs, primarily through its Velo development platform:
  * Fetch API:
This is the most common method and an implementation of the standard JavaScript Fetch API. It allows you to make HTTP requests to external APIs from your Wix site's frontend or backend code.
Backend calls: Recommended for security (especially for APIs requiring keys) and to avoid CORS issues. Use the Secrets Manager to securely store API keys.
Frontend calls: Possible but less secure and may encounter CORS restrictions.
  * npm Packages:
Velo supports the use of approved npm packages, allowing you to leverage a wide array of prebuilt JavaScript modules to extend your site's functionality with third-party features.
  * Service Plugins (formerly SPIs/Custom Extensions):
These enable you to inject custom logic or integrate third-party services directly into Wix's business solutions (e.g., Wix Stores, Wix Bookings). Service plugins allow you to customize specific parts of existing app flows or integrate external services for functionalities like custom shipping rates, dynamic pricing, or alternative payment providers.
  * HTTP Functions:
You can expose your site's functionality as an API, allowing third-party services to call your Wix site''s backend functions and interact with your site's data or logic.
Steps for Integration (using Fetch API as an example):
  * Store API Keys: If the third-party API requires authentication, store sensitive credentials like API keys securely in Wix's Secrets Manager.
Import wix-fetch: In your Velo backend or frontend code, import the wixFetch module.

```JavaScript
import { fetch } from 'wix-fetch';
```
  * Make API Calls: Use the fetch function to send requests to the third-party API, including necessary headers and body data.

```JavaScript
export async function getWeatherData() {
    const apiKey = await getSecret("yourApiKeyName"); // Retrieve from Secrets Manager
    const response = await fetch(`https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=London`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    return data;
}
```
  * Handle Responses: Process the data received from the API and integrate it into your site's design or functionality.
9. **Q: Is it possible to integrate AI APIs into WooCommerce?**
**A:** We do not currently have an official integration guide for using AI APIs with WooCommerce. However, the RESTful API itself does not impose any restrictions on the platform, provided it supports standard web queries.
We strongly recommend to begin by reading the official documentation provided by WooCommerce: https://woocommerce.com/document/woocommerce-rest-api/
Integrating third-party APIs with WooCommerce enhances store functionality and streamlines operations. This can be achieved through various methods:
  * Utilizing WooCommerce REST API:
WooCommerce provides a robust REST API that allows external applications to interact with your store data.
You can create API keys with specific permissions (Read, Write, or Read/Write) in WooCommerce > Settings > Advanced > REST API.
This enables you to automate tasks like inventory syncing, order processing, customer data synchronization, and more, by building custom integrations or using third-party services that leverage this API.
  * Employing Plugins:
Many WordPress and WooCommerce plugins are designed specifically for integrating with popular third-party services like payment gateways, shipping carriers, CRM systems, and accounting software.
Plugins often offer pre-built integrations, simplifying the setup process and reducing the need for custom coding.
Examples include plugins for specific payment processors (e.g., Stripe, PayPal), shipping solutions (e.g., FedEx, USPS), or general API integration tools like WPGet API.
  * Custom Code and Webhooks:
For unique integration needs or when a suitable plugin isn't available, you can implement custom code within your WordPress theme or a custom plugin.
This involves using WordPress/WooCommerce hooks and filters to trigger API calls at specific events (e.g., woocommerce_payment_complete for post-purchase actions).
Webhooks can also be used to send real-time data from WooCommerce to a third-party service when certain events occur (e.g., new order, product update).