# Postly 🔥

**Postly** is a modern, responsive, and dynamic social media web application built with Vanilla JavaScript, HTML, CSS, and Bootstrap, powered by **Supabase** as the Backend-as-a-Service (BaaS). The application features a stunning dark-mode UI with sleek glassmorphism effects, offering users a premium and interactive experience.

## ✨ Features

- **User Authentication:** Secure user registration and login functionality using Supabase Auth.
- **Dynamic Post Feed:** View a real-time feed of posts created by users, complete with timestamps and author information.
- **Create & Manage Posts:** Logged-in users can easily create new posts with text and images, as well as edit or delete their own posts.
- **Interactive Comments:** Engage with the community by adding comments to posts.
- **User Profiles:** Dedicated profile pages displaying user details (image, name, @username) along with their total post and comment counts, and a personalized feed of their posts.
- **Image Uploads:** Seamless image uploading for user avatars and post attachments utilizing Supabase Storage.
- **Premium UI/UX:** 
  - Sleek dark theme with neon glassmorphism effects.
  - Custom loaders, interactive modals, and smooth animations.
  - Fully responsive design that looks great on mobile, tablet, and desktop.

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3, JavaScript (Vanilla ES6+)
- **Styling Framework:** Bootstrap 5 & Bootstrap Icons
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage)
- **HTTP Client:** Axios

## 🚀 Getting Started

### Prerequisites
To run this project locally, you don't need any complex build tools. You just need a modern web browser and a local server (like VS Code Live Server).

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/YourUsername/Postly-App.git
   ```
2. Navigate into the project directory:
   ```bash
   cd Postly-App
   ```
3. Set up your Supabase project:
   - Create a new project on [Supabase](https://supabase.com/).
   - Set up your Database tables (`posts`, `comments`, `users`) and Storage buckets (`images`).
   - Copy your Supabase URL and Anon Key.
4. Configure the API Keys:
   - Open `supabase.js`.
   - Replace the `const supabaseUrl` and `const supabaseKey` with your own credentials.
5. Run the app:
   - Open `Home.html` using an extension like **Live Server** in VS Code.

## 🎨 Design Highlights
Postly places a heavy emphasis on visual aesthetics. From the custom loader overlay to the elegantly crafted glassmorphism modals and navigation bar, every element is designed to provide a cohesive and modern user experience.

---
