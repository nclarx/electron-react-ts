import { hot } from "react-hot-loader/root";
import React, { useState, useEffect } from "react";

const StarsDisplay = (props: { count: number }) => (
  <>
    {utils.range(1, props.count).map((starId) =>
      <div key={starId} className="star" />
    )}
  </>
)

const PlayNumber = (props: { num: number, status: string, onClick(num: number, status: string): void }) => {
  console.log(props)
  return (
    <button
      className="number"
      style={{ backgroundColor: colours[props.status] }}
      onClick={() => props.onClick(props.num, props.status)}>
      {props.num}
    </button >
  )
}

const PlayAgain = (props: { gameStatus: string, onClick(): void }) => (
  <div className="game-done">
    <div
      className="message"
      style={{ color: props.gameStatus === 'lost' ? 'red' : 'green' }}
    >
      {props.gameStatus === 'lost' ? 'Game Over' : 'You won!'}
    </div>
    <button onClick={props.onClick}>Play Again</button>
  </div>
)

const StarMatch = () => {
  const [gameId, setGameId] = useState(1)
  return <StarGame startNewGame={() => setGameId(gameId + 1)} key={gameId} />;
}

const App = () => {
  return (
    <StarMatch />
  )
}

const useGameState = () => {

  // Hooks - State
  const [stars, setStars] = useState(utils.random(1, 9))
  const [availableNums, setAvailableNums] = useState(utils.range(1, 9))
  const [candidateNums, setCandidateNums] = useState([])
  const [secondsLeft, setSecondsLeft] = useState(10)

  // Hooks - Effects
  useEffect(() => {
    if (secondsLeft > 0 && availableNums.length > 0) {
      const timerId = setTimeout(() => {
        setSecondsLeft(secondsLeft - 1)
      }, 1000)
      return () => clearTimeout(timerId)
    }
  })

  const setGameState = (newCandidateNums: number[]) => {
    if (utils.sum(newCandidateNums) !== stars) {
      setCandidateNums(newCandidateNums)
    } else {
      const newAvailableNums = availableNums.filter(
        (num) => !newCandidateNums.includes(num)
      )

      setStars(utils.randomSumIn(newAvailableNums, 9))
      setAvailableNums(newAvailableNums)
      setCandidateNums([])
    }
  }
  return { stars, availableNums, candidateNums, secondsLeft, setGameState };
}

const StarGame = (props: { startNewGame(): void }): JSX.Element => {

  const { stars, availableNums, candidateNums, secondsLeft, setGameState } = useGameState()

  // Logic ===
  const candidatesAreWrong = utils.sum(candidateNums) > stars

  const gameStatus = availableNums.length === 0
    ? 'won'
    : secondsLeft === 0 ? 'lost' : 'active'

  const numberStatus = (number: number): Status => {
    if (!availableNums.includes(number)) {
      return Status.Used
    }
    if (candidateNums.includes(number)) {
      return candidatesAreWrong ? Status.Wrong : Status.Candidate
    }
    return Status.Available
  }

  const onNumberClick = (number: number, currentStatus: string) => {

    if (currentStatus === 'used' || secondsLeft === 0) {
      return
    }

    const newCandidateNums =
      currentStatus === 'available' 
      ? candidateNums.concat(number)
      : candidateNums.filter(cn => cn !== number)

    setGameState(newCandidateNums)
  }

  return (
    <main className="game">
      <h1>
        The Star Game
      </h1>
      <section className="body">
        <div className="left">
          {gameStatus !== 'active' ? (
            <PlayAgain onClick={props.startNewGame} gameStatus={gameStatus} />
          ) : (
              <StarsDisplay count={stars} />
            )}
        </div>
        <div className="right">
          {utils.range(1, 9).map((number) =>
            <PlayNumber
              key={number}
              status={numberStatus(number)}
              num={number}
              onClick={onNumberClick}
            />
          )}
        </div>
      </section>
      <div className="timer">Time Remaining: {secondsLeft}</div>
    </main>
  )
}

enum Status {
  Available = 'available',
  Used = 'used',
  Wrong = 'wrong',
  Candidate = 'candidate'
}

type colours = {
  [key: string]: string;
}

// Color Theme
const colours: colours = {
  available: 'lightgray',
  used: 'lightgreen',
  wrong: 'lightcoral',
  candidate: 'deepskyblue',
};

// Math science
const utils = {
  // Sum an array
  sum: (arr: number[]) => arr.reduce((acc: number, curr: number) => acc + curr, 0),

  // create an array of numbers between min and max (edges included)
  range: (min: number, max: number) => Array.from({ length: max - min + 1 }, (_, i) => min + i),

  // pick a random number between min and max (edges included)
  random: (min: number, max: number) => min + Math.floor(Math.random() * (max - min + 1)),

  // Given an array of numbers and a max...
  // Pick a random sum (< max) from the set of all available sums in arr
  randomSumIn: (arr: any[], max: number) => {
    const sets = [[]];
    const sums = [];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0, len = sets.length; j < len; j++) {
        const candidateSet = sets[j].concat(arr[i]);
        const candidateSum = utils.sum(candidateSet);
        if (candidateSum <= max) {
          sets.push(candidateSet);
          sums.push(candidateSum);
        }
      }
    }
    return sums[utils.random(0, sums.length - 1)];
  },
};
export default hot(App);