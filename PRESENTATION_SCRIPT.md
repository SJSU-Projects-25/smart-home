# Smart Home Cloud Platform - Presentation Script
**Total Time: 20 minutes (15 min presentation + 5 min demo)**

---

## Team Introductions (30 seconds)

**Ashish (Product Owner):**
> "Good morning/afternoon everyone. I'm Ashish Bhusal, the Product Owner and Fullstack developer for this project. With me today are Ganesh Thampi, who handled our Backend and DevOps infrastructure; Harishita Gupta, our Frontend and UX specialist; and Kartikeya, who built our critical Ingestion pipeline and SQS integration. Together, we've built a Smart Home Cloud Platform that uses AI to make homes safer and smarter."

---

## Part 1: Problem & Vision (2 minutes) - **Ashish**

**Slide 1-2: Title + Problem Statement**

**Ashish:**
> "Let me start with a scenario. Imagine you're caring for an elderly parent living alone. Traditional home security systems can detect motion or open doors, but they can't tell the difference between your parent dropping a glass in the kitchen versus simply watching TV. That's the problem we set out to solve."

> "Current smart home systems are 'dumb sensors' - they trigger on thresholds but lack context. Our platform uses Machine Learning to *understand* what's happening in the home. We can distinguish between a dog barking, a smoke alarm going off, or glass breaking - and only alert you when it truly matters."

**Slide 3: Our Solution**

**Ashish:**
> "Our solution has three key pillars: First, intelligent audio classification using Google's YAMNet model. Second, a scalable cloud architecture that can handle thousands of devices without breaking. And third, role-based interfaces - one for homeowners to monitor their homes, and another for technicians to install and maintain the system."

> "Now let me hand it over to Harishita to show you what this looks like from a user's perspective."

---

## Part 2: Frontend & User Experience (3 minutes) - **Harishita**

**Slide 4-5: Owner Dashboard**

**Harishita:**
> "Thank you, Ashish. As the Frontend and UX lead, my goal was to make this powerful system feel simple and intuitive."

> "This is the Owner Dashboard. When you log in, you immediately see your home's health at a glance. Here's the alerts panel - notice how we use color coding: red for high-severity events like glass breaking or smoke alarms, yellow for medium-priority like unusual loud noises, and blue for informational events."

> "What makes this special is the configurability. See these model configuration cards? Users can customize their experience. For example, if you have a dog, you can disable 'Dog Bark' alerts entirely, or adjust the confidence threshold. Maybe you only want to be notified if the system is 90% sure, not 70%."

**Slide 6: Technician Dashboard**

**Harishita:**
> "Now, installing smart home systems is traditionally complex. We built a dedicated Technician Dashboard to streamline this."

> "Technicians can view installation requests, claim jobs, and register new devices on-site. But here's the killer feature - the Test Upload tool. Before leaving a customer's home, the technician can upload a test audio clip right from this interface to verify the device is working and the ML model is detecting correctly. This eliminates callback visits."

> "The entire frontend is built with Next.js and React, deployed as a static site on AWS CloudFront for global low-latency access. Now, let me pass it to Ganesh to explain what happens behind the scenes."

---

## Part 3: Backend Architecture & DevOps (4 minutes) - **Ganesh**

**Slide 7-8: System Architecture**

**Ganesh:**
> "Thanks, Harishita. I'm Ganesh, and I architected the backend and cloud infrastructure."

> "Let me walk you through our architecture. At the top, we have our Next.js frontend served from S3 and CloudFront. When a user interacts with the dashboard, requests go through an Application Load Balancer to our FastAPI backend running on EC2 Auto Scaling Groups."

> "Here's where it gets interesting. We use a polyglot persistence strategy - two databases for different needs. PostgreSQL stores structured, relational data: users, homes, devices, and alerts. This is where we need ACID compliance and complex joins."

> "MongoDB stores our high-volume event data - every single audio classification result, even if it doesn't trigger an alert. This gives us a complete audit trail and enables future analytics like 'show me noise trends over the past month.'"

**Slide 9: Infrastructure as Code**

**Ganesh:**
> "Everything you see here is defined in Terraform - our Infrastructure as Code tool. This means we can spin up an identical production environment in minutes, or tear down our dev environment to save costs overnight."

> "We manage VPCs, subnets, security groups, EC2 instances, RDS databases, S3 buckets - all version-controlled in Git. This was crucial when we hit issues during development. For example, we had a critical bug where the API couldn't connect to MongoDB. Using Terraform, I could quickly diagnose that our Security Groups weren't allowing traffic on port 27017, add the rule, and redeploy - all without manual AWS console clicking."

**Slide 10: Handling Scale**

**Ganesh:**
> "Now, here's a challenge we faced: ML inference is slow. Running YAMNet on a 10-second audio clip takes 2-3 seconds of CPU time. If we did this synchronously in the API, we'd block the server and crash under load."

> "Our solution? Asynchronous processing with SQS. The API responds immediately after queuing the job, and independent Worker instances process the queue. This means our API can handle 1000 requests per second while Workers churn through them steadily in the background. And because Workers are in an Auto Scaling Group, AWS automatically adds more when the queue gets long."

> "Let me hand it to Kartikeya to dive deeper into this ingestion pipeline."

---

## Part 4: Ingestion Pipeline & SQS (3 minutes) - **Kartikeya**

**Slide 11-12: The Ingestion Flow**

**Kartikeya:**
> "Thanks, Ganesh. I'm Kartikeya, and I built the core ingestion pipeline - the heart of our system."

> "Let me walk you through what happens when a device uploads audio. Step one: The device requests a presigned URL from our API. This is a temporary, secure URL that allows direct upload to S3 - bypassing our server entirely. This is critical for handling large audio files efficiently."

> "Step two: Once the upload completes, the device calls our `/ingest/confirm` endpoint. The API creates an Event record in MongoDB with status 'pending', then pushes a message to our SQS queue containing the S3 key and event ID."

> "Step three: Our Worker, which is constantly polling SQS, picks up this message. It downloads the audio from S3, runs it through the YAMNet model, and gets back a classification and confidence score."

**Slide 13: From Detection to Alert**

**Kartikeya:**
> "Step four is where the intelligence happens. The Worker checks the user's Model Configuration in PostgreSQL. Is this event type enabled? Is the confidence score above their threshold? If both are true, we create an Alert in PostgreSQL."

> "For high-severity alerts - like glass breaking or smoke alarms - we also trigger email notifications immediately. The entire pipeline, from upload to alert, takes about 5-10 seconds end-to-end."

> "One challenge we solved: Initially, the Worker was crashing after processing a few jobs. We discovered TensorFlow was corrupting the database connection pool. Our solution was to isolate the ML inference in a separate subprocess using Python's multiprocessing. Now it's rock solid."

> "Now, let me hand it back to Ashish to talk about our ML model and future plans."

---

## Part 5: ML Model & Future Roadmap (2.5 minutes) - **Ashish**

**Slide 14-15: YAMNet Model**

**Ashish:**
> "Thanks, Kartikeya. Let's talk about the brain of our system - the YAMNet model."

> "YAMNet is a deep neural network from Google Research, trained on AudioSet - a dataset of 2 million YouTube clips covering 521 audio classes. It can detect everything from speech and music to animal sounds, vehicle noises, and critically, hazard sounds like alarms and breaking glass."

> "We run this model locally on our Worker instances - no external API calls, which means low latency and no per-request costs. We've also mapped YAMNet's 521 classes to user-friendly categories. For example, YAMNet might detect 'Glass_shatter' or 'Breaking_glass' - we map both to 'Security Alert: Glass Breaking.'"

**Slide 16: Challenges Overcome**

**Ashish:**
> "Building this wasn't without challenges. We had database migration conflicts that crashed the API during development. We had MongoDB connectivity issues due to misconfigured Security Groups. We had Worker stability problems due to TensorFlow memory leaks."

> "But each challenge taught us something. We learned the importance of robust logging, infrastructure visibility, and defensive programming. And we documented everything in our Git repository, so the next team can learn from our mistakes."

**Slide 17: Future Roadmap**

**Ashish:**
> "Looking ahead, we have exciting plans. First, live audio streaming using WebRTC, so users can listen in real-time. Second, moving inference to the edge - running YAMNet directly on Raspberry Pi devices to reduce bandwidth and latency. Third, a native mobile app for push notifications. And fourth, advanced analytics - showing users long-term trends like 'your home is getting noisier over time.'"

> "But what we've built today is production-ready, scalable, and solving a real problem. Now, let's see it in action. Harishita, would you like to drive the demo?"

---

## Part 6: Live Demo (5 minutes) - **Harishita (primary) + Team**

**Harishita:**
> "Absolutely. Let me share my screen. I'm going to walk you through a typical user journey."

### Demo Flow:

**1. Login & Dashboard (30 seconds)**
> "I'm logging in as a homeowner. Notice the smooth authentication - we're using JWT tokens for secure, stateless sessions. And here's my dashboard. I can see I have 3 devices installed and 2 open alerts."

**2. View Alerts (1 minute)**
> "Let me click into Alerts. See this red one from 2 hours ago? 'Glass Breaking detected in Kitchen' with 94% confidence. I can click to see details - the exact timestamp, which device detected it, and even a link to the raw audio file in S3 if I want to verify."

> "And here's a blue informational alert - 'Dog Bark detected in Living Room.' Because I configured this as low-priority, it's just logged, not sent to my phone."

**3. Configure Models (1 minute)**
> "Now let me show you the Model Configuration page. I have four detection models enabled: Glass Breaking, Smoke Alarm, Dog Bark, and Speech."

> "Watch this - I'm going to disable Dog Bark entirely and increase the Glass Breaking threshold to 90%. Click save... and done. Now the system will ignore all dog barks and only alert me for glass breaking if it's 90% confident or higher."

**Ganesh (interjects):**
> "And behind the scenes, that just updated a row in our PostgreSQL ModelConfig table. The next time the Worker processes an event, it'll read this new configuration."

**4. Technician Test Upload (1.5 minutes)**
> "Now let me switch to the Technician view. I'm going to log in as a technician."

> "Here's the Test Upload page. I select the home I'm working on, choose a device - let's say 'Kitchen Microphone' - and upload a test audio file."

**[Upload a pre-recorded glass breaking sound]**

> "I'm uploading this glass-break.wav file... and watch the top right for the success notification."

**Kartikeya (interjects):**
> "While that's uploading, let me explain what's happening. The file is going directly to S3 using a presigned URL. Then our API is pushing a job to SQS. Our Worker will pick it up in the next few seconds."

**Harishita:**
> "There it is - 'Test uploaded successfully! Job ID: abc-123.' Now if I switch back to the Owner dashboard and refresh..."

**[Refresh the Alerts page]**

> "...there's the new alert! 'Glass Breaking detected in Kitchen' with 98% confidence, just now. This proves the device is working, the ML model is accurate, and the entire pipeline is functioning."

**5. Wrap-up (1 minute)**

**Ashish:**
> "And that's our Smart Home Cloud Platform in action. To recap: We've built a scalable, AI-powered system that makes homes safer by understanding context, not just detecting noise. We've solved real engineering challenges around async processing, database design, and ML integration. And we've created an intuitive user experience that both homeowners and technicians love."

> "We're proud of what we've built, and we're excited about where it's going. Thank you for your time. We're happy to take questions."

---

## Q&A Preparation (Backup - if time allows)

**Potential Questions & Answers:**

**Q: "How accurate is the YAMNet model?"**
**Ganesh/Kartikeya:**
> "YAMNet achieves around 70-90% accuracy depending on the audio class. For critical events like glass breaking and smoke alarms, we see 85-95% accuracy in our testing. That's why we give users control over the confidence threshold - they can tune it to their comfort level."

**Q: "What's the cost to run this in production?"**
**Ganesh:**
> "Great question. Our dev environment costs about $150/month on AWS: $50 for RDS, $30 for EC2 instances, $20 for S3/CloudFront, and the rest for data transfer. At scale, with 10,000 devices, we estimate $800-1000/month, or about $0.10 per device per month - very competitive with traditional monitoring services."

**Q: "How do you handle privacy concerns with audio data?"**
**Ashish:**
> "Privacy is critical. First, we only store audio clips that trigger events, not continuous recording. Second, all data is encrypted in transit (HTTPS) and at rest (S3 encryption). Third, users can delete their audio files at any time. And fourth, we're exploring on-device processing so audio never leaves the home."

**Q: "Can this work with video cameras too?"**
**Harishita:**
> "Absolutely. The architecture is designed to be extensible. We'd add a video ingestion endpoint, swap YAMNet for a video classification model like MobileNet, and the rest of the pipeline stays the same. That's the beauty of our decoupled design."

---

## Timing Breakdown

| Section | Speaker | Time |
|---------|---------|------|
| Intro | Ashish | 0:30 |
| Problem & Vision | Ashish | 2:00 |
| Frontend/UX | Harishita | 3:00 |
| Backend/DevOps | Ganesh | 4:00 |
| Ingestion/SQS | Kartikeya | 3:00 |
| ML & Future | Ashish | 2:30 |
| **Total Presentation** | | **15:00** |
| Live Demo | Harishita + Team | 5:00 |
| **Grand Total** | | **20:00** |

---

## Presentation Tips

**For Ashish (Product Owner):**
- Start strong with the emotional hook (elderly parent scenario)
- Keep the vision clear and business-focused
- Tie technical details back to user value

**For Harishita (Frontend):**
- Use the live site, not screenshots, whenever possible
- Emphasize user empathy ("we built this for real people")
- Practice the demo flow until it's muscle memory

**For Ganesh (Backend/DevOps):**
- Use the architecture diagram as your anchor
- Don't get too deep into AWS specifics unless asked
- Emphasize reliability and scalability

**For Kartikeya (Ingestion/SQS):**
- Walk through the flow step-by-step with visuals
- Highlight the async pattern as a key innovation
- Be ready to explain SQS vs. other queue systems if asked

**General:**
- Speak slowly and clearly
- Make eye contact with the audience, not the screen
- If you go over time, cut the "Challenges" slide - it's interesting but not critical
- Have fun! You built something impressive.
