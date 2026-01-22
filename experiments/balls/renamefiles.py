import os

def rename_files(folder_path='.', prefix='ball'):
    """
    Rename all files in a folder to prefix_1, prefix_2, etc.
    
    Args:
        folder_path: Path to the folder (default is current directory)
        prefix: Prefix for renamed files (default is 'ball')
    """
    # Get the script's own filename to exclude it
    script_name = os.path.basename(__file__)
    
    # Get all files in the folder (excluding this script)
    files = [f for f in os.listdir(folder_path) 
             if os.path.isfile(os.path.join(folder_path, f)) and f != script_name]
    
    # Sort files to maintain consistent order
    files.sort()
    
    print(f"Found {len(files)} files to rename\n")
    
    # Rename each file
    for index, filename in enumerate(files, start=1):
        # Get file extension
        _, ext = os.path.splitext(filename)
        
        # Create new filename
        new_name = f"{prefix}_{index}{ext}"
        
        # Get full paths
        old_path = os.path.join(folder_path, filename)
        new_path = os.path.join(folder_path, new_name)
        
        # Rename the file
        os.rename(old_path, new_path)
        print(f"Renamed: {filename} → {new_name}")
    
    print(f"\nSuccessfully renamed {len(files)} files!")

if __name__ == "__main__":
    # Change these settings as needed
    folder_path = '.'  # Current directory, or specify a path like '/path/to/folder'
    prefix = 'ball'     # Change this to use a different prefix
    
    rename_files(folder_path, prefix)