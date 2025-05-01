# E-Commerce Trust Score Chrome Extension - Backend

This is the backend server for the **E-Commerce Trust Score Chrome Extension**, which provides trust scores, feedback, and reviews for e-commerce websites. The server is built using **Node.js**, **Express**, and **MongoDB**, and integrates with **OpenAI** for AI-generated feedback.

---

## Features

- **Website Verification**: Check if a website is verified and retrieve its trust score.
- **Feedback Management**: Add user feedback and calculate ratings using Bayesian and time-decay algorithms.
- **AI-Generated Feedback**: Use OpenAI to analyze review messages and categorize feedback.
- **Error Handling**: Comprehensive error handling for validation, database, and runtime errors.

---

## Project Structure

```
.env
.env.example
.gitignore
.prettierrc.json
eslint.config.mjs
package.json
README.md
src/
  app.ts
  server.ts
  app/
    configaration/
      index.ts
    errors/
      AppError.ts
      handleCastError.ts
      handleDuplicateError.ts
      handleValidationError.ts
      handleZodError.ts
    interface/
      error.ts
      index.d.ts
      website.ts
    middlewares/
      globalErrorHandler.ts
      notFound.ts
      validateRequests.ts
    modules/
      verifiedWebsite/
        verifiedwebsite.controller.ts
        verifiedwebsite.route.ts
        verifiedwebsite.services.ts
        verifiedwebsite.model.ts
        verifiedwebsite.interface.ts
        verifiedWebsite.consts.ts
    routes/
      index.ts
    utils/
      sendResponse.ts
      extractValues.ts
      catchAsync.ts
      calculateRating.ts
```

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd E-CommerceTrustScoreChromeExtensionServer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the following variables:
   ```env
   NODE_ENVIRONMENT=development
   PORT=8080
   DATABASE_URL=<your_mongodb_connection_string>
   OPENAI_API_KEY=<your_openai_api_key>
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Start the server:
   - Development mode:
     ```bash
     npm run dev
     ```
   - Production mode:
     ```bash
     npm start
     ```

---

## API Endpoints

### 1. **Check Verified Website**
   - **URL**: `/api/v1/website/check`
   - **Method**: `GET`
   - **Query Parameters**:
     - `name` (string): The website URL to check.
   - **Response**:
     ```json
     {
       "success": true,
       "message": "The website has been successfully retrieved.",
       "data": {
         "website": { "verified": true, "rating": 4.5 },
         "recentReviews": [...],
         "mostCommonFeedback": [...]
       }
     }
     ```

### 2. **Add Feedback**
   - **URL**: `/api/v1/website/review`
   - **Method**: `POST`
   - **Body**:
     ```json
     {
       "reviewMessage": "The website is beautiful, but the quality of their clothes is not good.",
       "siteId": "677bdcdad3ad95823e4eda0b",
       "feedback": {
         "ProductQuality": [{ "name": "Durability", "baseRating": 4 }],
         "CustomerServices": [{ "name": "Responsiveness", "baseRating": 5 }],
         "PlatformExperience": [{ "name": "Ease of Use", "baseRating": 5 }]
       }
     }
     ```
   - **Response**:
     ```json
     {
       "success": true,
       "message": "The website feedback has been successfully retrieved.",
       "data": { ... }
     }
     ```

### 3. **AI-Generated Feedback**
   - **URL**: `/api/v1/website/ai-generated-feedback/:id`
   - **Method**: `GET`
   - **Response**:
     ```json
     {
       "success": true,
       "message": "The website feedback has been successfully retrieved.",
       "data": {
         "ProductQuality": [...],
         "CustomerServices": [...],
         "PlatformExperience": [...]
       }
     }
     ```

---

## Technologies Used

- **Node.js**: Backend runtime environment.
- **Express**: Web framework for building APIs.
- **MongoDB**: NoSQL database for storing website, feedback, and review data.
- **OpenAI**: AI integration for analyzing review messages.
- **TypeScript**: Strongly typed JavaScript for better code quality.
- **Zod**: Schema validation for request payloads.
- **Day.js**: Lightweight library for date manipulation.

---

## Development Scripts

- **Start Development Server**:
  ```bash
  npm run dev
  ```
- **Build Project**:
  ```bash
  npm run build
  ```
- **Run Linter**:
  ```bash
  npm run lint
  ```
- **Fix Linter Issues**:
  ```bash
  npm run lint:fix
  ```
- **Format Code**:
  ```bash
  npm run format
  ```

---

## Error Handling

The server includes a global error handler to manage various types of errors:
- **Validation Errors**: Handled using `Zod` and Mongoose validation.
- **Duplicate Errors**: Managed for unique constraints in MongoDB.
- **Unhandled Rejections**: Gracefully shuts down the server.
- **Uncaught Exceptions**: Ensures the server exits safely.

---

## Environment Variables

| Variable           | Description                          |
|--------------------|--------------------------------------|
| `NODE_ENVIRONMENT` | Application environment (e.g., `development`, `production`). |
| `PORT`             | Port number for the server.         |
| `DATABASE_URL`     | MongoDB connection string.          |
| `OPENAI_API_KEY`   | API key for OpenAI integration.      |

---

## License

This project is licensed under the **MIT License**.

---

## Author

Developed by **Saif Al Islam**.