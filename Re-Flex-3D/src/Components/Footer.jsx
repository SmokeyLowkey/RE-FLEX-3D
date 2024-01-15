import React, { useState, useEffect } from 'react';

const Footer = ({ modelIdentifier}) => {
  const [question, setQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [answerColor, setAnswerColor] = useState('');
  const [questionType, setQuestionType] = useState('');
  const [partData, setPartData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchRandomPartAndGenerateQuestion = async () => {
    setLoading(true);
    const baseUrl = import.meta.env.VITE_RENDER_BASE_URL;
    try {
      
      // Fetch random part details
      const partResponse = await fetch(`${baseUrl}/api/random-part/${modelIdentifier}`);
      if (!partResponse.ok) {
        throw new Error('Failed to fetch part details');
      }
      const partData = await partResponse.json();
      setPartData(partData)
      console.log(partData);
      // // Constructing the prompt for OpenAI

      // Define question types
      const questionTypes = ['part_number', 'part_name', 'quantity', 'description'];
      // Randomly select a question type
      const randomQuestionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      setQuestionType(randomQuestionType);

      // Generate a question based on the type
      let questionPrompt = '';
      switch (randomQuestionType) {
        case 'part_number':
          console.log("this is a partnumber q: ")
          questionPrompt = `generate a customer service question in the view of a customer asking a customer support person for the following: ${partData.part_name}. Ask to find the part number.`;
          break;

        case 'part_name':
          console.log("this is a partname q: ")
          questionPrompt = `generate a customer service question in the view of a customer asking a customer support person for the following: ${partData.part_number}. Ask to find the name of this part number`; 
          break;

        case 'quantity': 
        console.log("this is a quantity q: ")
          questionPrompt = `generate a customer service question in the view of a customer asking a customer support person for the following: ${partData.quantity}. Ask for 'What is the total quantity available for the part named ${partData.part_name}?'`; 
          break; 

        case 'description': 
        console.log("this is a description q: ")
          questionPrompt = `generate a customer service question in the view of a customer asking a customer support person for the following: ${partData.part_name}. Ask a 'What doe the ${partData.description} contain?'.`; 
          break; 

        default: 
        console.log("this is a default q: ")
          questionPrompt = `generate a customer service question in the view of a customer asking a customer support person for the following: ${partData.part_name}. Ask for the part number for the part name.`;
      }
      // OpenAI API call
      const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // or "gpt-4" depending on your preference
        messages: [
          {"role": "system", "content": "You are a helpful assistant."},
          {"role": "user", "content": questionPrompt}
        ]
      }),
    });

    const data = await openAIResponse.json();
    setQuestion(data.choices[0].message.content);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAnswer = () => {
    if (!partData || !questionType) {
      console.log("Data not found!");
      return;
    }
  
    let correctAnswer;
    switch (questionType) {
      case 'part_number':
        correctAnswer = partData.part_number;
        break;
      case 'part_name':
        correctAnswer = partData.part_name;
        break;
      case 'quantity':
        correctAnswer = partData.quantity.toString(); // Assuming quantity is a number
        break;
      case 'description':
        correctAnswer =   'description';
        break;    
      // Add more cases as needed
      default:
        correctAnswer = ''; // Default case if questionType is unknown
    }
    console.log("Correct Answer:", correctAnswer);

    if (userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()) {
      setAnswerColor('Correct!');
      setUserAnswer(''); // Reset the answer input
      fetchRandomPartAndGenerateQuestion(); // Fetch a new question
    } else {
      setAnswerColor('Wrong!');
    }
  };

  useEffect(() => {
    if (modelIdentifier) {
      console.log("the model selected is : ", modelIdentifier)
      fetchRandomPartAndGenerateQuestion();
    }
  }, [modelIdentifier]);

  return (
    <footer className="app-footer">
     
      {loading ? <p>Loading...</p> : <p>Question: {question}</p>}
      <input
        type="text"
        value={userAnswer}
        onChange={(e) => setUserAnswer(e.target.value)}
        placeholder="Type your answer here"
      />
      <button onClick={checkAnswer}>Check Answer</button>
      <p>Answer status: {answerColor}</p>

      <p style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', textAlign: 'left' }}>
        &copy; {new Date().getFullYear()} Parts Catalog, Inc.
      </p>
    </footer>
  );
};

export default Footer;
