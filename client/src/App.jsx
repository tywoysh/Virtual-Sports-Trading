import './App.css'
import IndividualTeams from './components/IndividualTeams';
import Navbar from './components/Navbar'
import {Route, Routes} from 'react-router-dom';


function App() {

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/ind-teams" element={<IndividualTeams />} />
        <Route path="/team-ex" element={<div>Team Exchange</div>} />
      </Routes>
    </>
  )
}

export default App
