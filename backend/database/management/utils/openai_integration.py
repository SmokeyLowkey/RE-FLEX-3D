from openai import OpenAI
from decouple import config

# Initialize OpenAI client
client = OpenAI(api_key=config("OPENAI_API_KEY"))

def generate_openai_question(machine_name, part_name, part_number, description):
    try:
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": f"Generate a customer service question about a machine part as if you are the customer. Machine Name: {machine_name}, Part Name: {part_name}, Part Number: {part_number}, Description: {description}."}
        ]

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages
        )

        question = response.choices[0].message
        return question

    except Exception as e:  # Replace with specific exceptions as necessary
        print(f"An error occurred: {e}")
        return None
