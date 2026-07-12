import re

files = [
    r'c:\Users\Lisbon\Desktop\crs\frontend\src\pages\AdminPage.jsx',
    r'c:\Users\Lisbon\Desktop\crs\frontend\src\pages\HomePage.jsx',
    r'c:\Users\Lisbon\Desktop\crs\frontend\src\pages\ReportFormPage.jsx',
    r'c:\Users\Lisbon\Desktop\crs\frontend\src\pages\TrackPage.jsx',
    r'c:\Users\Lisbon\Desktop\crs\frontend\src\pages\AdminLogin.jsx',
    r'c:\Users\Lisbon\Desktop\crs\frontend\src\App.jsx',
]

for filepath in files:
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Replace axios imports with api imports if not already done
        if 'import axios from \'axios\';' in content:
            content = content.replace('import axios from \'axios\';', 'import api from \'../api/axios\';')
        
        # Replace `http://${window.location.hostname}:8000/api` with empty string or change axios.something to api.something
        # Pattern for `http://${window.location.hostname}:8000/api/endpoint` -> `/endpoint`
        content = re.sub(r'`http\://\$\{window\.location\.hostname\}\:8000/api([^`]*)`', r'`\1`', content)
        
        # Pattern for "http://${window.location.hostname}:8000/api..." -> "..."
        content = re.sub(r'"http\://\$\{window\.location\.hostname\}\:8000/api([^"]*)"', r'"\1"', content)
        content = re.sub(r"'http\://\$\{window\.location\.hostname\}\:8000/api([^']*)'", r"'\1'", content)
        
        # Replace axios. with api.
        content = content.replace('axios.', 'api.')
        
        # Add toast import and replace alerts
        if 'import toast from' not in content and 'react-hot-toast' not in content:
            # We will insert it after react imports
            content = re.sub(r'(import React.*?\n)', r'\1import toast from "react-hot-toast";\n', content, count=1)
            
        content = re.sub(r'alert\((.*?)\)', r'toast(\1)', content)

        # Pagination support: res.data -> (res.data.results || res.data)
        # Note: We'll do this carefully. 
        # For setReports(res.data) -> setReports(res.data.results || res.data)
        content = re.sub(r'setReports\((\w+)\.data\)', r'setReports(\1.data.results || \1.data)', content)
        content = re.sub(r'setUsers\((\w+)\.data\)', r'setUsers(\1.data.results || \1.data)', content)
        content = re.sub(r'setStories\((\w+)\.data\)', r'setStories(\1.data.results || \1.data)', content)
        content = re.sub(r'setFaqs\((\w+)\.data\)', r'setFaqs(\1.data.results || \1.data)', content)
        
        # Remove getAxiosConfig stuff since interceptor handles it
        # Just replace getAxiosConfig() with {} to not break arguments, but interceptor will attach token anyway
        content = content.replace('getAxiosConfig()', '{}')

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Refactored {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
