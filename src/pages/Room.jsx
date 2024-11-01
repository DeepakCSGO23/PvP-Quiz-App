import { useEffect, useState } from "react";
import { useWebSocket } from "../contexts/WebSocketContext"; // Adjust the path as necessary
import Header from "../components/Header";
const Room = () => {
  const { ws } = useWebSocket();
  const [questions, setQuestions] = useState([]);
  useEffect(() => {
    if (ws) {
      console.log(ws);
      // Handle incoming messages or perform actions
      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        console.log("Message received in Room:", data);
      };
      // ws.onclose = (e) => {
      //   console.log("web socket closed");
      // };
    }
    return () => {
      // Optional cleanup if needed
    };
  }, [ws]);
  // This effect runs when the component is rendered for the first time only
  useEffect(() => {
    setQuestions([
      {
        type: "multiple",
        difficulty: "hard",
        category: "Entertainment: Television",
        question: "Who played the sun baby in the original run of Teletubbies?",
        correct_answer: "Jessica Smith",
        incorrect_answers: ["Pui Fan Lee", "Sue Monroe", "Lisa Brockwell"],
      },
      {
        type: "multiple",
        difficulty: "easy",
        category: "Entertainment: Video Games",
        question:
          "In the videogame Bully, what is the protagonist&#039;s last name?",
        correct_answer: "Hopkins",
        incorrect_answers: ["Smith", "Kowalski", "Crabblesnitch"],
      },
      {
        type: "multiple",
        difficulty: "hard",
        category: "Entertainment: Television",
        question:
          "In &quot;Star Trek&quot;, who was the founder of the Klingon Empire and its philosophy?",
        correct_answer: "Kahless the Unforgettable",
        incorrect_answers: [
          "Lady Lukara of the Great Hall",
          "Molor the Unforgiving",
          "Dahar Master Kor",
        ],
      },
      {
        type: "multiple",
        difficulty: "hard",
        category: "Geography",
        question: "What is the name of the Canadian national anthem?",
        correct_answer: "O Canada",
        incorrect_answers: [
          "O Red Maple",
          "Leaf-Spangled Banner",
          "March of the Puck Drop",
        ],
      },
      {
        type: "multiple",
        difficulty: "hard",
        category: "Science &amp; Nature",
        question:
          "Burning which of these metals will produce a bright white flame?",
        correct_answer: "Magnesium",
        incorrect_answers: ["Copper", "Lithium", "Lead"],
      },
    ]);
    // const fetchQuestion = async () => {
    //   const response = await fetch(
    //     "https://opentdb.com/api.php?amount=10&category=21&type=multiple"
    //   );
    //   const data = await response.json();
    //   console.log(data);
    //   setQuestions(data.results);
    // };
    // fetchQuestion();
  }, []);
  // const handleClosing = () => {
  //   ws.close();
  // };
  return (
    <div className="flex flex-col h-screen w-screen text-white font-roboto">
      <Header />
      <div className="flex flex-col h-full w-full bg-[#C5E6DF] text-black items-center justify-center dashboard p-20">
        {/* Parent for quiz questions */}
        <div className="flex flex-col space-y-10">
          {/* Rendering Questions */}
          {questions &&
            questions.map((question, index) => (
              <div
                key={index}
                className="flex flex-col items-start text-sm space-y-4"
              >
                {/* Question */}
                <p>
                  {index + 1}.{question.question}
                </p>
                {/* Options */}
                <div className="flex space-x-4">
                  {question.incorrect_answers.map((option, index) => (
                    <button
                      key={index}
                      className="p-4 bg-black/80 text-white rounded-3xl hover:bg-green-500 duration-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Room;
