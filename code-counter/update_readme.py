import re
import locale
from github import Github
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get GitHub username and token from environment variables
GITHUB_USERNAME = os.getenv('GITHUB_USERNAME')
GITHUB_TOKEN = os.getenv('GITHUB_TOKEN')

# Authenticate with GitHub
g = Github(GITHUB_TOKEN)

# Set locale for number formatting
locale.setlocale(locale.LC_ALL, '')

def get_repo_list(username):
    user = g.get_user(username)
    repos = user.get_repos()
    return repos

def load_ignored_files():
    try:
        with open('ignored_files.txt', 'r') as file:
            return [line.strip() for line in file.readlines()]
    except FileNotFoundError:
        return []

def count_lines_of_code(repo, ignored_files):
    total_lines = 0
    try:
        contents = repo.get_contents("")
        print(f"Counting lines in repository: {repo.name}")
    except:
        print(f"Skipping empty repository: {repo.name}")
        return total_lines  # Return 0 if the repository is empty or an error occurs
    while contents:
        file_content = contents.pop(0)
        if file_content.type == "dir":
            contents.extend(repo.get_contents(file_content.path))
        else:
            if file_content.path in ignored_files:
                print(f"Ignoring file: {file_content.path}")
                continue
            try:
                content = file_content.decoded_content.decode('utf-8')
                total_lines += len(content.split('\n'))
            except:
                pass
    print(f"Total lines in {repo.name}: {total_lines}")
    return total_lines

def update_readme(repo, total_lines):
    try:
        readme = repo.get_readme()
        content = readme.decoded_content.decode('utf-8')
        
        formatted_lines = locale.format_string("%d", total_lines, grouping=True)
        new_content = re.sub(
            r'(<div align="center" id="update_code_counter">.*?</div>)', 
            f'<div align="center" id="update_code_counter">This profile contains a total of {formatted_lines} lines of code across all projects. We\'re growing steadily.</div>', 
            content,
            flags=re.DOTALL
        )
        
        repo.update_file(readme.path, "Updated total lines of code", new_content, readme.sha)
        print(f"Updated README in {repo.name} with total lines of code: {formatted_lines}")
    except Exception as e:
        print(f"Could not update README in {repo.name}: {e}")

def main():
    ignored_files = load_ignored_files()
    repos = get_repo_list(GITHUB_USERNAME)
    total_lines = 0
    for repo in repos:
        if not repo.fork:  # Only consider non-fork repositories
            total_lines += count_lines_of_code(repo, ignored_files)
    profile_repo = g.get_repo(f"{GITHUB_USERNAME}/{GITHUB_USERNAME}")
    update_readme(profile_repo, total_lines)

if __name__ == "__main__":
    main()
