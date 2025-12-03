# Smart Home Cloud Platform - Presentation Outline

## Section 1: Introduction & Overview

### Slide 1: Title Slide
*   **Title:** Smart Home Cloud Platform
*   **Subtitle:** A Scalable, AI-Powered IoT Monitoring Solution
*   **Presenter:** [Your Name]
*   **Date:** December 2025
*   **Visual:** Project Logo or a high-quality image of a smart home dashboard.

### Slide 2: Executive Summary
*   **Goal:** To build a robust, scalable cloud platform for monitoring smart home audio events.
*   **Key Innovation:** Integration of edge-ready AI (YAMNet) with a cloud-native architecture.
*   **Impact:** Real-time detection of critical events (glass break, alarms) for senior living and home security.
*   **Visual:** A simple 3-step icon flow: Microphone -> Cloud -> Alert.

### Slide 3: The Team & Roles
*   **Frontend Engineer:** Built the Next.js dashboard for Owners and Technicians.
*   **Backend Engineer:** Designed the FastAPI services and PostgreSQL/MongoDB schemas.
*   **DevOps/Cloud Architect:** Managed AWS infrastructure (Terraform, EC2, S3, SQS).
*   **ML Engineer:** Integrated the TensorFlow YAMNet model for audio classification.
*   **Visual:** Team photos or role icons.

---

## Section 2: Problem & Solution

### Slide 4: The Problem
*   **Challenge:** Traditional home security systems are rigid, expensive, and lack intelligent audio context.
*   **Gap:** "Dumb" sensors trigger on simple thresholds, leading to false alarms.
*   **Need:** A system that *understands* the environment (e.g., distinguishing a dog bark from a glass break).
*   **Visual:** Image of a frustrated user dealing with a false alarm or a complex control panel.

### Slide 5: Our Solution
*   **Intelligent Monitoring:** Uses Machine Learning to classify audio events in real-time.
*   **Scalable Cloud Backend:** Decoupled architecture handles high data volume without crashing.
*   **Role-Based Access:** Distinct interfaces for Home Owners (monitoring) and Technicians (setup).
*   **Visual:** Split screen showing the sleek Owner Dashboard vs. the functional Technician Dashboard.

---

## Section 3: System Architecture

### Slide 6: High-Level Architecture
*   **Frontend:** Next.js (React) hosted on S3 + CloudFront (Global CDN).
*   **API Layer:** FastAPI on EC2 (Auto Scaling) + Application Load Balancer.
*   **Processing Layer:** Python Workers on EC2 (Auto Scaling) consuming SQS queues.
*   **Storage:** PostgreSQL (Relational), MongoDB (Events), S3 (Audio Files).
*   **Visual:** A clean, high-level architecture diagram showing the flow from User -> CloudFront -> ALB -> API -> DB.

### Slide 7: The "Ingestion Pipeline" (Core Flow)
*   **Step 1:** Device uploads audio directly to S3 (Presigned URLs) - fast & secure.
*   **Step 2:** API confirms upload and pushes a job to SQS (Message Queue).
*   **Step 3:** Worker picks up job, downloads audio, and runs ML inference.
*   **Step 4:** Results stored in MongoDB; Alerts created in Postgres.
*   **Visual:** A flowchart arrow diagram: Device -> S3 -> SQS -> Worker -> Database.

### Slide 8: Database Strategy (Polyglot Persistence)
*   **PostgreSQL (RDS):**
    *   Stores: Users, Homes, Devices, Alerts, Model Configs.
    *   Why: Requires ACID compliance, strict schemas, and complex relationships.
*   **MongoDB:**
    *   Stores: Raw Audio Events, Sensor Logs.
    *   Why: High write volume, flexible schema, time-series data.
*   **Visual:** Split diagram showing "Structured Data" (Tables) vs. "Unstructured Events" (Documents).

### Slide 9: Infrastructure as Code (IaC)
*   **Tool:** Terraform.
*   **Benefits:** Reproducible, version-controlled infrastructure.
*   **Resources Managed:** VPCs, Subnets, Security Groups, EC2 Instances, Load Balancers, S3 Buckets.
*   **Environment:** Dev/Prod parity (easy to spin up new environments).
*   **Visual:** Screenshot of a Terraform `.tf` file and a "Apply Complete" terminal output.

---

## Section 4: Key Features & Workflows

### Slide 10: The Owner Dashboard
*   **Overview:** At-a-glance view of home health and recent alerts.
*   **Alerts:** Real-time list of detected events (High/Medium/Low severity).
*   **Configuration:** Enable/Disable specific detection models (e.g., "Ignore Dog Barks").
*   **Visual:** Screenshot of the Owner Dashboard showing the "Alerts" list and "Model Config" cards.

### Slide 11: The Technician Dashboard
*   **Purpose:** Simplify installation and device management.
*   **Installation Requests:** View and claim jobs assigned by admins.
*   **Device Setup:** Register new hardware (Microphones, Sensors) to a home.
*   **Test Upload:** Verify device connectivity and ML model accuracy on-site.
*   **Visual:** Screenshot of the Technician "Device Test" page.

### Slide 12: Audio Classification (YAMNet)
*   **Model:** Google's YAMNet (trained on AudioSet).
*   **Capabilities:** Detects 521+ audio classes (Speech, Music, Animal sounds, Hazards).
*   **Implementation:** Running in a separate process on Workers to ensure stability.
*   **Customization:** Mapped raw classes to user-friendly categories (e.g., "Glass Breaking" -> "Security Alert").
*   **Visual:** A waveform graphic transforming into a label like "Glass Break (98%)".

### Slide 13: Alerting Logic
*   **Thresholds:** Users set confidence thresholds (e.g., "Only alert if > 80% sure").
*   **Severity:** Events are auto-tagged (Glass Break = High, Dog Bark = Low).
*   **Notifications:** High-severity alerts trigger immediate emails/SMS.
*   **Visual:** Logic tree: Event Detected -> Check Config -> Check Threshold -> Create Alert -> Send Email.

### Slide 14: Security & Auth
*   **Authentication:** JWT (JSON Web Tokens) for stateless, secure API access.
*   **Network Security:**
    *   Private Subnets for Databases.
    *   Security Groups (Firewalls) restricting traffic (API -> DB only).
*   **Data Security:** Presigned URLs for S3 uploads (no permanent credentials on client).
*   **Visual:** Lock icon and a diagram of the VPC network isolation.

---

## Section 5: Technical Deep Dive

### Slide 15: Handling Scale (Async Processing)
*   **Problem:** ML inference is slow (CPU intensive). Blocking the API would crash the server.
*   **Solution:** Asynchronous Worker Pattern using SQS.
*   **Benefit:** API remains fast (ms response); Workers scale independently based on queue depth.
*   **Visual:** Diagram showing API handling 1000 requests/sec while Workers process them steadily in the background.

### Slide 16: Solving "The Crash" (A Case Study)
*   **Issue:** API was crashing with "500 Internal Server Error" during uploads.
*   **Root Cause:**
    1.  Database migration conflicts (duplicate columns).
    2.  MongoDB connectivity issues (wrong IP in config).
*   **Fix:**
    1.  Refactored Alembic migrations.
    2.  Containerized MongoDB on Worker instance and fixed Security Groups.
*   **Lesson:** Robust logging and infrastructure visibility are crucial.
*   **Visual:** "Before" (Crash logs) vs. "After" (Green Health Checks).

### Slide 17: CI/CD & Deployment
*   **Pipeline:** GitHub Actions / Shell Scripts (`push_images.sh`).
*   **Docker:** All services (API, Worker, Frontend) are containerized.
*   **Deployment:**
    *   Backend: `docker pull` on EC2 (via User Data scripts).
    *   Frontend: Static export synced to S3.
*   **Visual:** Docker logo, GitHub logo, and an AWS EC2 icon.

---

## Section 6: Conclusion & Future

### Slide 18: Challenges Overcome
*   **Integration:** Connecting Python (FastAPI) with Node.js (Next.js) and TensorFlow.
*   **Infrastructure:** Debugging AWS networking (Security Groups, VPCs) and IAM roles.
*   **State Management:** Keeping Postgres and MongoDB in sync.
*   **Visual:** A "Hurdles" graphic or checklist of solved problems.

### Slide 19: Future Roadmap
*   **Live Streaming:** WebRTC for real-time audio listening.
*   **Edge AI:** Move inference to the device (Raspberry Pi) to save bandwidth.
*   **Mobile App:** Native iOS/Android app for push notifications.
*   **Advanced Analytics:** Long-term trends (e.g., "Noise levels increasing over time").
*   **Visual:** A roadmap timeline graphic.

### Slide 20: Q&A
*   **Thank You!**
*   **Links:**
    *   GitHub Repository
    *   Live Demo URL
*   **Visual:** Large "Questions?" text with contact info.
