# nova_coach_finder.py
import requests
from bs4 import BeautifulSoup
import pandas as pd
import os
import time
import json
import logging
from datetime import datetime
import re
from typing import Dict, List, Optional
import sqlite3
from flask import Flask, render_template, jsonify, request
import threading

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Contact Validation Interface</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Contact Validation Dashboard</h1>

        <!-- Stats Overview -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-700">Total Contacts</h3>
                <p class="text-2xl font-bold text-blue-600" id="total-contacts">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-700">Pending Validation</h3>
                <p class="text-2xl font-bold text-yellow-600" id="pending-count">0</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-700">Success Rate</h3>
                <p class="text-2xl font-bold text-green-600" id="success-rate">0%</p>
            </div>
            <div class="bg-white p-4 rounded-lg shadow">
                <h3 class="text-lg font-semibold text-gray-700">Learning Progress</h3>
                <p class="text-2xl font-bold text-purple-600" id="learning-progress">0%</p>
            </div>
        </div>

        <!-- Contact List -->
        <div class="bg-white rounded-lg shadow mb-8">
            <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold">Contacts to Validate</h2>
            </div>
            <div class="divide-y divide-gray-200" id="contact-list">
                <!-- Contact cards will be inserted here -->
            </div>
        </div>

        <!-- Failure Modal -->
        <div id="failure-modal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
            <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div class="mt-3">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">Mark Contact as Failed</h3>
                    <input type="hidden" id="failure-contact-id">
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700">Failure Type</label>
                        <select id="failure-type" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                            <option value="wrong_person">Wrong Person</option>
                            <option value="wrong_email">Wrong Email</option>
                            <option value="wrong_title">Wrong Title</option>
                            <option value="invalid_data">Invalid Data</option>
                            <option value="not_found">Not Found</option>
                        </select>
                    </div>
                    
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-gray-700">Notes</label>
                        <textarea id="failure-notes" rows="3" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
                    </div>

                    <div class="flex justify-end space-x-3">
                        <button onclick="closeFailureModal()" class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">Cancel</button>
                        <button onclick="submitFailure()" class="px-4 py-2 bg-red-600 text-white rounded-md">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        function renderContact(contact) {
            return `
                <div class="p-6 hover:bg-gray-50" id="contact-${contact.id}">
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold">${contact.name}</h3>
                            <p class="text-gray-600">${contact.role} at ${contact.school}</p>
                            <p class="text-gray-600">${contact.email}</p>
                            <p class="text-sm text-gray-500 mt-2">Found: ${new Date(contact.found_date).toLocaleDateString()}</p>
                        </div>
                        <div class="space-x-2">
                            <button onclick="validateContact(${contact.id}, true)" 
                                    class="px-4 py-2 bg-green-600 text-white rounded-md">
                                Valid
                            </button>
                            <button onclick="showFailureModal(${contact.id})" 
                                    class="px-4 py-2 bg-red-600 text-white rounded-md">
                                Invalid
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }

        // Add all the JavaScript functions from above...
        // showFailureModal, closeFailureModal, submitFailure, validateContact, updateStats, loadContacts
    </script>
</body>
</html>
"""

class CoachFinderAgent:
    def __init__(self, model_name: str = "llama3.2"):
        self.setup_directories()
        self.setup_database()
        self.setup_logging()
        self.model = model_name
        self.base_url = "http://localhost:11434/api"

    def setup_directories(self):
        """Initialize directory structure."""
        self.base_dir = os.path.expanduser("~/Desktop/contact_finder")
        self.data_dir = os.path.join(self.base_dir, "data")
        self.csv_dir = os.path.join(self.base_dir, "exports")
        self.log_dir = os.path.join(self.base_dir, "logs")
        self.template_dir = os.path.join(self.base_dir, "templates")
        
        for directory in [self.base_dir, self.data_dir, self.csv_dir, self.log_dir, self.template_dir]:
            os.makedirs(directory, exist_ok=True)
            
        self.db_path = os.path.join(self.data_dir, "contacts.db")
        
        # Save HTML template
        template_path = os.path.join(self.template_dir, "index.html")
        if not os.path.exists(template_path):
            with open(template_path, 'w') as f:
                f.write(HTML_TEMPLATE)

    def setup_database(self):
        """Initialize SQLite database."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Contacts table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS contacts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    role TEXT NOT NULL,
                    email TEXT,
                    school TEXT NOT NULL,
                    region TEXT NOT NULL,
                    source_url TEXT,
                    found_date TIMESTAMP,
                    validated BOOLEAN DEFAULT FALSE,
                    validation_notes TEXT,
                    retry_count INTEGER DEFAULT 0,
                    last_retry_date TIMESTAMP,
                    failure_type TEXT,
                    needs_retry BOOLEAN DEFAULT FALSE
                )
            """)
            
            # Learning table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS learning (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    pattern TEXT NOT NULL,
                    success_count INTEGER DEFAULT 0,
                    fail_count INTEGER DEFAULT 0,
                    last_used TIMESTAMP,
                    is_successful BOOLEAN
                )
            """)

    def setup_logging(self):
        """Configure logging."""
        self.logger = logging.getLogger('CoachFinder')
        self.logger.setLevel(logging.INFO)
        
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        
        # File handler
        log_file = os.path.join(self.log_dir, f'finder_{datetime.now().strftime("%Y%m%d")}.log')
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        self.logger.addHandler(file_handler)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        self.logger.addHandler(console_handler)

    def handle_failure(self, contact_id: int, failure_type: str, notes: str = ""):
        """Handle a failed contact discovery."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute("""
                UPDATE contacts 
                SET validated = FALSE,
                    failure_type = ?,
                    validation_notes = ?,
                    needs_retry = TRUE,
                    retry_count = retry_count + 1
                WHERE id = ?
            """, (failure_type, notes, contact_id))
            
            # Log failure for learning
            cursor.execute("""
                UPDATE learning 
                SET fail_count = fail_count + 1,
                    last_used = ?,
                    is_successful = FALSE
                WHERE id IN (
                    SELECT learning_id FROM contact_patterns 
                    WHERE contact_id = ?
                )
            """, (datetime.now(), contact_id))

    def retry_failed_contact(self, contact_id: int):
        """Retry finding contact info with new strategy."""
        # Implementation of retry logic here
        pass

    def export_to_csv(self, validated_only: bool = True):
        """Export contacts to CSV file."""
        with sqlite3.connect(self.db_path) as conn:
            query = "SELECT * FROM contacts"
            if validated_only:
                query += " WHERE validated = TRUE"
            
            df = pd.read_sql_query(query, conn)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f'contacts_{"validated" if validated_only else "all"}_{timestamp}.csv'
            filepath = os.path.join(self.csv_dir, filename)
            
            df.to_csv(filepath, index=False)
            self.logger.info(f"Exported contacts to {filepath}")
            return filepath

def create_app(agent):
    app = Flask(__name__)
    
    @app.route('/')
    def index():
        return render_template('index.html')

    @app.route('/contacts')
    def get_contacts():
        with sqlite3.connect(agent.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, name, role, email, school, region, found_date
                FROM contacts 
                WHERE validated = FALSE 
                AND needs_retry = FALSE
                ORDER BY found_date DESC
                LIMIT 50
            """)
            
            contacts = [{
                'id': row[0],
                'name': row[1],
                'role': row[2],
                'email': row[3],
                'school': row[4],
                'region': row[5],
                'found_date': row[6]
            } for row in cursor.fetchall()]
            
            return jsonify({'contacts': contacts})

    @app.route('/mark_failure', methods=['POST'])
    def mark_failure():
        data = request.get_json()
        agent.handle_failure(
            contact_id=data['contact_id'],
            failure_type=data['failure_type'],
            notes=data.get('notes', '')
        )
        return jsonify({'success': True})

    return app

def run_agent():
    agent = CoachFinderAgent(model_name="llama3.2")
    app = create_app(agent)
    app.run(port=5000)

if __name__ == "__main__":
    run_agent()