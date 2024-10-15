import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import ImageRecognition from './ImageRecognition';
import DataAnnotation from './DataAnnotation';
const backendUrl = process.env.REACT_APP_API_URL;
function App() {
  return (
    <Router>
      <div>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>我的应用</Typography>
            <Button color="inherit" component={Link} to="/">图片识别</Button>
            <Button color="inherit" component={Link} to="/data-annotation">数据标注</Button>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<ImageRecognition />} />
          <Route path="/data-annotation" element={<DataAnnotation />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
