Getting Started
1. Clone the Repository
Open a terminal and run:
git clone https://github.com/zake97/brainy-boost-planner.git


2. Open the Project in VS Code
cd your-repo-name
code .
Or manually: Open VS Code → File → Open Folder → select the cloned folder.

3. Install Dependencies
In the VS Code terminal (Ctrl + ``  `` ` or Terminal → New Terminal), run:
npm install

4. Start the Development Server
npm run dev
Your app will be running at http://localhost:5173 (or similar — check your terminal output).

🔁 Keeping Your Code in Sync
If you make changes in Lovable and push them to GitHub, pull the latest changes in VS Code:
bashgit pull origin main
If you make changes locally in VS Code and want to push them to GitHub:
bashgit add .
git commit -m "your message here"
git push origin main
