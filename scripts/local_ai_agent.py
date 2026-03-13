import time
import ollama
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class DjangoAgent(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith(".py") and "venv" not in event.src_path:
            print(f"\n📂 Change detected: {event.src_path}")
            self.get_ai_review(event.src_path)

    def get_ai_review(self, file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            print("🧠 Local AI is analyzing...")
            response = ollama.chat(model='qwen2.5-coder:3b', messages=[
                {'role': 'system', 'content': 'You are a Django expert. Review the code and give 2 bullet points: one for what is good, and one for an improvement.'},
                {'role': 'user', 'content': f"Review this file:\n{content}"}
            ])
            print("\n--- AI AUTO-REPLY ---\n" + response['message']['content'] + "\n----------------------\n")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    event_handler = DjangoAgent()
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=True)
    observer.start()
    print("🚀 Agent Started! Save a Django file to see my reply.")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()