```markdown
# ReviewPinger

ReviewPinger is a web application specifically designed for Bates Electric technicians to effortlessly send SMS requests for Google reviews to their customers. The application enhances technicians' ability to request feedback efficiently while providing management with valuable insights and performance metrics through comprehensive reporting features.

## Overview

ReviewPinger is structured as a full-stack web application comprising a ReactJS-based frontend and an Express.js backend. The frontend is hosted under the `client/` folder utilizing Vite for development and build processes, while the backend resides under the `server/` folder, incorporating Express.js to serve RESTful API endpoints and manage MongoDB interactions using Mongoose.

### Architecture and Technologies:

**Frontend:**
- ReactJS with Vite devserver
- Shadcn-UI component library with Tailwind CSS
- Client-side routing with react-router-dom
- All frontend requests directed to `/api/` prefixed endpoints
- Runs on port 5173

**Backend:**
- Express.js server
- REST API implementation
- MongoDB with Mongoose as the database layer
- Token-based authentication using JWT
- Runs on port 3000

### Project Structure:
- `client/`: Contains the ReactJS frontend
  - `client/src/`: Main source directory with components, pages, and API request definitions
  - `client/src/api/`: Holds API request functions with mock data structures
- `server/`: Hosts the Express.js backend
  - `server/routes/`: Defines various route handlers for the API
  - `server/models/`: Mongoose schemas for database entities
  - `server/services/`: Service layer for integrating with third-party APIs and handling business logic

## Features

**Primary Functional Features:**
- **Service Location Selection:** Dropdown menu for technicians to select the service city.
- **Technician Identification:** Dropdown menu for technicians to attribute review requests correctly.
- **Customer Information:** Input fields for the customer’s first name and mobile number with automatic formatting and validation.
- **Message Preview Section:** Real-time SMS message preview with character count.
- **Send SMS:** Easy-to-use controls for sending or resetting the review requests.
- **Success/Error Handling:** Clear messages for both successful operations and failed sends.

**Reporting and Analytics:**
- Performance tracking by city and technician.
- Success vs. failure rates visualization.
- Data export functionality for further analysis.
- Combined dashboard view for overall activity tracking.

## Getting Started

### Requirements

Ensure your development environment has the following setup:
- Node.js (v14.17.0 or higher)
- MongoDB (v4.4 or higher)

### Quickstart

Follow these steps to get the project up and running:

1. **Clone the Repository:**
   ```sh
   git clone <repository_url>
   cd reviewpinger
   ```

2. **Install Dependencies:**
   ```sh
   npm install
   ```

3. **Set Up Environment Variables:**
   Configure your environment variables by creating a `.env` file in the `server/` directory with the necessary keys:
   - `PORT`: Port number for the backend server (default is 3000)
   - `DATABASE_URL`: MongoDB connection URL
   - `JWT_SECRET`: Secret key for JWT token generation
   - `SIMPLETEXTING_API_KEY`: API key for SimpleTexting integration
   - `BITLY_API_KEY`: API key for Bitly URL shortening service

4. **Seed the Database (optional but recommended):**
   ```sh
   # From the project root directory
   node server/scripts/seedDatabase.js
   ```

5. **Start the Project:**
   ```sh
   npm run start
   ```
   This command will concurrently start both the frontend and backend servers.

6. **Access the Application:**
   - Open your browser and navigate to `http://localhost:5173` to interact with the frontend.
   - The backend will be accessible at `http://localhost:3000`.

### License

The project is proprietary (not open source), and is distributed under Copyright (c) 2024.
```
