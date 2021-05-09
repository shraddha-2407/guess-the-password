import React from 'react';
import './App.css';

const App = () => {
  const [hint, setHint] = React.useState('');
  const [noGame, setNoGame] = React.useState(false);
  const [showFormError, setShowFormError] = React.useState({
    status: false,
    message: ''
  });

  const [userEntryList, setUserEntryList] = React.useState([{
    count: 0,
    highlight: [],
    answer: '',
    correct: false
  }]);

  React.useEffect(() => {
    setNoGame(false);
    fetch('/new-password').then(res => res.json()).then(res => {
      setHint(res.hint);
    });
  }, []);

  // utility functions
  const checkForDuplicates = (answer) => {
     return (/([0-9]).*?\1/).test(answer);
  }

  const isNumberOnly = (answer) => {
    return /^\d+$/.test(answer);
  }

  const hasLength = (answer, len) => {
    return answer.length === len;
  }

  const validateAnswer = (answer) => {
    let errorObj = showFormError;
    if (answer === '') {
      errorObj = {
        status: true,
        message: 'Please enter a value'
      }
    } else if (!hasLength(answer, 8)) {
      errorObj = {
        status: true,
        message: 'Please enter 8 unique digits only'
      };
    } else if (hasLength(answer, 8)) {
      if (checkForDuplicates(answer)) {
        errorObj = {
          status: true,
          message: 'Please enter unique digits only'
        };
      } else if (!isNumberOnly(answer)){
        errorObj = {
          status: true,
          message: 'Please enter only digits'
        };
      }
    }
    return errorObj;
  }

  // form: submit function
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowFormError({
      status: false,
      message: ''
    });
    const answer = e.target.elements.answer.value;
    // testing for user entry validations
    const error = validateAnswer(answer);
    setShowFormError(error);

    // fetch only when user entry is valid
    if (!error.status) {
      fetch('/verify-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hint: hint,
          answer
        })
      }).then(res => {
          return res.ok ? res.json() : { status: res.status }; 
        }).then(data => {
        if (data.status === 404) {
          setNoGame(true);
        } else {
          let newList = [...userEntryList];
          newList.push({
            highlight: data.highlight || [],
            correct: data.correct,
            count: userEntryList.length,
            answer: data.answer
          });
          setUserEntryList(newList);
        }
      });
    }
  }

  return (
    <div className="App">
      {!noGame ? (
        <div className="container">
          <div className="gameHeading">
            <h1>Guess the Password</h1>
          </div>
          <div className="gameBody">
            <div className="gameLineItem">
              <div className="content">Hint</div>
              <div className="gameHint">{hint}</div>
            </div>
            {
              userEntryList.length !== 0 && userEntryList.map(item => {
                return (
                  item.count > 0 && (
                    !item.correct ? <div key={`user-answer-${item.count}`} className="gameLineItem">
                      <div className="content">User entry {`${item.count}`}</div>
                      <div className="gameUserAnswer">
                        {
                          item.answer.split('').map((num, index) => {
                            if(item.highlight.includes(num)) {
                              return <span key={`${num}-${index}`} className='gameNumHightlighter'>{num}</span>
                            } else {
                              return <span key={`${num}-${index}`}>{num}</span>
                            }
                          })
                        }
                      </div>
                    </div> : <div key={`user-answer-${item.count}`} className="gameLineItem">
                      <div className="content">User entry {`${item.count}`}</div>
                      <div className="gameUserAnswer">
                        SUCCESS
                      </div>
                    </div>
                  )
                );
              })
            }
            <form data-testid='game-form' method="POST" onSubmit={handleSubmit} className="gameForm">
              {showFormError.status && <div data-testid='game-error' className='gameError'>
                {showFormError.message}
              </div>}
              <fieldset>
                <input placeholder="Type here" id="answer" name="answer" />
                <ul>
                  <li key={'required'}>Required</li>
                  <li key={'numbers'}>Please enter numbers only</li>
                  <li key={'digits'}>Please only enter unique digits</li>
                </ul>
              </fieldset>
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>) : <div className="gameMissing">404 <p>Game Over! Please Refresh!</p></div>
      }
      </div>
  );
}
export default App;