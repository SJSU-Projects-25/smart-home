"""ML model runner for processing device data."""
import csv
import os
from typing import Any

import numpy as np
import tensorflow as tf
import tensorflow_hub as hub

# Disable GPU for worker
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"


class ModelRunner:
    """Model runner for inference using TensorFlow YAMNet."""

    def __init__(self):
        self.yamnet_model = None
        self.yamnet_classes = []
        
        # User-defined classes for Senior Living
        self.user_labels = [
            "Fall / Impact",
            "Distress / Pain",
            "Choking / Vomiting",
            "Breathing Emergency",
            "Fire / Smoke Alarm",
            "Glass Break",
            "Coughing",
            "Water Running",
            "Door / Knock",
            "Footsteps"
        ]
        
        # Mapping from YAMNet class names to User class names
        self.class_mapping = {
            # 1. Fall / Impact
            "Thud": "Fall / Impact",
            "Bump": "Fall / Impact",
            "Smack, whack": "Fall / Impact",
            "Falling down": "Fall / Impact",
            "Slap, smack": "Fall / Impact",
            
            # 2. Distress / Pain
            "Scream": "Distress / Pain",
            "Shout": "Distress / Pain",
            "Yell": "Distress / Pain",
            "Groan": "Distress / Pain",
            "Moan": "Distress / Pain",
            "Crying, sobbing": "Distress / Pain",
            "Baby cry, infant cry": "Distress / Pain",
            "Whimper": "Distress / Pain",
            "Wail, moan": "Distress / Pain",
            
            # 3. Choking / Vomiting
            "Choking": "Choking / Vomiting",
            "Vomit": "Choking / Vomiting",
            "Retching": "Choking / Vomiting",
            "Gagging": "Choking / Vomiting",
            "Burping, eructation": "Choking / Vomiting",
            "Hiccup": "Choking / Vomiting",
            
            # 4. Breathing Emergency
            "Gasp": "Breathing Emergency",
            "Wheeze": "Breathing Emergency",
            "Panting": "Breathing Emergency",
            "Hyperventilation": "Breathing Emergency",
            "Sniff": "Breathing Emergency",
            "Heavy breathing": "Breathing Emergency",
            
            # 5. Fire / Smoke Alarm
            "Smoke detector, smoke alarm": "Fire / Smoke Alarm",
            "Fire alarm": "Fire / Smoke Alarm",
            "Buzzer": "Fire / Smoke Alarm",
            "Alarm": "Fire / Smoke Alarm",
            "Siren": "Fire / Smoke Alarm",
            "Civil defense siren": "Fire / Smoke Alarm",
            
            # 6. Glass Break
            "Glass": "Glass Break",
            "Shatter": "Glass Break",
            "Breaking": "Glass Break",
            "Crack": "Glass Break",
            
            # 7. Coughing
            "Cough": "Coughing",
            "Throat clearing": "Coughing",
            
            # 8. Water Running
            "Pour": "Water Running",
            "Trickle, dribble": "Water Running",
            "Liquid": "Water Running",
            "Water": "Water Running",
            "Drip": "Water Running",
            "Toilet flush": "Water Running",
            "Bathtub (filling or washing)": "Water Running",
            "Sink (filling or washing)": "Water Running",
            
            # 9. Door / Knock
            "Door": "Door / Knock",
            "Knock": "Door / Knock",
            "Doorbell": "Door / Knock",
            "Ding-dong": "Door / Knock",
            "Tap": "Door / Knock",
            "Slam": "Door / Knock",
            
            # 10. Footsteps
            "Walk, footsteps": "Footsteps",
            "Footsteps": "Footsteps",
            "Run": "Footsteps",
            "Shuffle": "Footsteps",
        }

    def load(self) -> None:
        """Load the model and class map."""
        try:
            print("ModelRunner: Starting model load...", flush=True)
            # Load YAMNet model from SavedModel format (bundled in Docker image)
            model_path = os.path.join(os.path.dirname(__file__), "yamnet_savedmodel")
            print(f"ModelRunner: Checking for model at {model_path}", flush=True)
            if os.path.exists(model_path):
                print(f"ModelRunner: Loading YAMNet model from {model_path}", flush=True)
                self.yamnet_model = tf.saved_model.load(model_path)
                print("ModelRunner: YAMNet model loaded from SavedModel", flush=True)
            else:
                # Fallback to TFHub if local model not found
                print("ModelRunner: Local SavedModel not found, trying TFHub...", flush=True)
                yamnet_url = "https://tfhub.dev/google/yamnet/1"
                print(f"ModelRunner: Downloading/Loading from {yamnet_url}...", flush=True)
                self.yamnet_model = hub.load(yamnet_url)
                print("ModelRunner: YAMNet model loaded from TFHub", flush=True)
            
            print("ModelRunner: Loading class map...")
            # Load class map
            class_map_path = os.path.join(os.path.dirname(__file__), "yamnet_class_map.csv")
            with open(class_map_path, 'r') as f:
                reader = csv.DictReader(f)
                # YAMNet outputs are ordered by index in this CSV
                # We need to store them in order to map index -> name
                # The CSV has columns: index, mid, display_name
                # We'll create a list where index i contains the display_name
                temp_classes = {}
                for row in reader:
                    temp_classes[int(row['index'])] = row['display_name']
                
                self.yamnet_classes = [temp_classes[i] for i in range(len(temp_classes))]
                print(f"ModelRunner: Loaded {len(self.yamnet_classes)} YAMNet classes")
            
            print("ModelRunner: Model and class map loaded successfully!")
        except Exception as e:
            print(f"ModelRunner: Failed to load model or class map: {e}")
            import traceback
            traceback.print_exc()
            raise

    def predict(self, wav_bytes: bytes) -> dict[str, Any]:
        """
        Run inference on audio data using YAMNet and map to user classes.
        """
        if self.yamnet_model is None:
            raise RuntimeError("Model not loaded")

        try:
            # Decode WAV
            print(f"ModelRunner: Decoding {len(wav_bytes)} bytes of WAV...", flush=True)
            waveform, sample_rate = tf.audio.decode_wav(wav_bytes, desired_channels=1)
            sample_rate_val = int(sample_rate.numpy())
            print(f"ModelRunner: WAV decoded. Sample rate: {sample_rate_val}. Squeezing...", flush=True)
            waveform = tf.squeeze(waveform, axis=-1)
            
            # Resample to 16000Hz if needed
            if sample_rate_val != 16000:
                print(f"ModelRunner: Resampling from {sample_rate_val}Hz to 16000Hz...", flush=True)
                # Convert to numpy for resampling
                waveform_np = waveform.numpy()
                # Calculate new length
                new_length = int(len(waveform_np) * 16000 / sample_rate_val)
                # Simple linear interpolation resampling
                import numpy as np
                indices = np.linspace(0, len(waveform_np) - 1, new_length)
                waveform_resampled = np.interp(indices, np.arange(len(waveform_np)), waveform_np)
                waveform = tf.constant(waveform_resampled, dtype=tf.float32)
                print("ModelRunner: Resampling complete.", flush=True)
            
            # Run YAMNet
            # scores: (N, 521) - prediction for each frame
            print("ModelRunner: Running YAMNet inference...", flush=True)
            scores, embeddings, spectrogram = self.yamnet_model(waveform)
            print("ModelRunner: Inference complete. Calculating mean scores...", flush=True)
            
            # Average scores across all frames to get clip-level prediction
            # mean_scores: (521,)
            mean_scores = np.mean(scores, axis=0)
            print(f"ModelRunner: Mean scores calculated. Shape: {mean_scores.shape}", flush=True)
            
            # Map YAMNet scores to User classes
            print("ModelRunner: Starting score mapping...", flush=True)
            user_scores = {label: 0.0 for label in self.user_labels}
            
            for i, score in enumerate(mean_scores):
                if i % 100 == 0:
                    print(f"ModelRunner: Mapping index {i}...", flush=True)
                yamnet_label = self.yamnet_classes[i]
                if yamnet_label in self.class_mapping:
                    user_label = self.class_mapping[yamnet_label]
                    # Accumulate score (or take max? Accumulating makes sense if multiple YAMNet classes map to one)
                    # But since these are probabilities, summing might exceed 1.0. 
                    # Taking max is safer for "detection" logic, or we can sum and clip.
                    # Let's take MAX for now to represent "confidence that at least one of these subtypes is present"
                    user_scores[user_label] = max(user_scores[user_label], float(score))
            print("ModelRunner: Score mapping complete.", flush=True)
            
            # Find top YAMNet class (raw) and top mapped user class
            raw_top_idx = int(np.argmax(mean_scores))
            raw_top_label = self.yamnet_classes[raw_top_idx]
            raw_top_score = float(mean_scores[raw_top_idx])
            print(f"ModelRunner: Top YAMNet class: {raw_top_label} ({raw_top_score:.4f})", flush=True)

            top_event = max(user_scores.items(), key=lambda x: x[1])
            print(f"ModelRunner: Top mapped event: {top_event}", flush=True)
            
            top_user_label = top_event[0]
            top_score = top_event[1]
            
            # Determine severity
            # High severity for distress, emergency, or critical health events
            high_severity_events = [
                "Fall / Impact",
                "Distress / Pain",
                "Choking / Vomiting",
                "Breathing Emergency",
                "Fire / Smoke Alarm",
                "Glass Break"
            ]
            # Medium severity for health warnings or potential hazards
            medium_severity_events = [
                "Coughing",
                "Water Running"
            ]
            
            if top_user_label in high_severity_events:
                severity = "high"
            elif top_user_label in medium_severity_events:
                severity = "medium"
            else:
                severity = "low"

            return {
                "type": top_user_label,
                "severity": severity,
                "score": top_score,
                "scores": user_scores,
            }

        except Exception as e:
            print(f"ModelRunner: Inference error: {e}")
            return {
                "type": "error",
                "severity": "low",
                "score": 0.0,
                "scores": {},
            }
