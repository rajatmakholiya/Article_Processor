import os
import mysql.connector
from docx import Document

# 1. Connect to your Docker Database
db = mysql.connector.connect(
    host="localhost",      # Since you exposed port 3306 in Docker
    user="root",
    password="rootpassword",
    database="content_improver"
)
cursor = db.cursor()

# 2. Folder containing your .docx files
folder_path = "./articles" # Make sure your docs are in this subfolder
folder_path = "./articles" # Make sure your docs are in this subfolder

print("Starting import...")

for filename in os.listdir(folder_path):
    if filename.endswith(".docx"):
        file_path = os.path.join(folder_path, filename)
        
        # Read the .docx file
        doc = Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        
        content = "\n".join(full_text)
        title = filename.replace(".docx", "") # Use filename as title for now
        
        # Insert into MySQL
        sql = "INSERT INTO articles (title, original_content, status, created_at) VALUES (%s, %s, 'pending', NOW())"
        val = (title, content)
        
        try:
            cursor.execute(sql, val)
            db.commit()
            print(f"Imported: {title}")
        except Exception as e:
            print(f"Error importing {title}: {e}")

print("All done!")
db.close()