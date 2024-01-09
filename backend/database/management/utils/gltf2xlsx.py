from pygltflib import GLTF2
from openpyxl import Workbook
from collections import Counter

def gltf_to_xlsx(gltf_file_path, xlsx_file_path):
    # Load the GLTF file using pygltflib
    gltf = GLTF2().load(gltf_file_path)
    
    # Create a Counter object to count occurrences of part numbers
    part_number_counter = Counter()
    
    # First pass to count part numbers
    for node in gltf.nodes:
        if node.extras and 'part_number' in node.extras:
            part_number_counter[node.extras['part_number']] += 1
    
    # Create a new workbook and select the active worksheet
    wb = Workbook()
    ws = wb.active
    
    # Set the title for the worksheet
    ws.title = "GLTF Data"
    
    # Create the header row
    headers = ["Part Number", "Name", "Description", "Quantity"]
    ws.append(headers)
    
    # Second pass to write data to the workbook
    for node in gltf.nodes:
        part_number = node.extras.get('part_number', 'N/A') if node.extras else 'N/A'
        name = node.name if node.name else 'N/A'
        description = 'PLACEHOLDER FOR DESCRIPTION'  # Replace with actual description if available
        quantity = part_number_counter[part_number] if part_number in part_number_counter else 1
        
        # Append the data to the worksheet
        ws.append([part_number, name, description, quantity])
    
    # Save the workbook to the specified file path
    wb.save(xlsx_file_path)

# Usage example
gltf_to_xlsx('C:\\RE-FLEX-3D - Copy\\backend\\models\\model333G\\333G.glb', 'C:\\RE-FLEX-3D - Copy\\backend\\xlsx\\full_333G.xlsx')
