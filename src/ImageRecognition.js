import React, { useState } from 'react';
import { Box, Button, CircularProgress, Card, CardContent, Grid, Typography, Table, TableBody, TableCell, TableHead, TableRow, Checkbox } from '@mui/material';
import axios from 'axios';
axios.defaults.baseURL = 'http://gj03.khdxs7.site:20601/';
function ImageRecognition() {
  const [selectedImage, setSelectedImage] = useState(null);  // 用户上传的图片
  const [base64Image, setBase64Image] = useState('');        // 存储 Base64 编码的图片
  const [resultImage, setResultImage] = useState(null);      // 接口返回的base64图片
  const [recognitionResults, setRecognitionResults] = useState([]);  // 接口返回的识别结果
  const [loading, setLoading] = useState(false);             // 加载状态
  const [error, setError] = useState(null);                  // 错误状态
  const [selectedIndices, setSelectedIndices] = useState({}); // 存储每个index的复选框状态

  // 处理图片上传
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setSelectedImage(base64String); // 显示还原后的图片
        setBase64Image(base64String);   // 在文本框中显示 Base64 编码
        setError(null);  // 清除可能存在的错误
      };
      reader.readAsDataURL(file);
    }
  };

  // 调用后端 API，发送 Base64 图片进行识别
  const handleRecognition = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://gj03.khdxs7.site:20601/api/recognize', {
        image: selectedImage,
      });
      setResultImage(response.data.base64);
      const modifiedResults = response.data.recognition_results.map(result => ({
        ...result,
        image: result.image // 这里可以替换为具体的每个项的 image 字段
      }));
      setRecognitionResults(modifiedResults);  // 设置识别结果
    } catch (err) {
      setError('识别失败，请稍后再试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 处理index复选框点击
  const handleIndexCheckboxChange = (index) => {
    setSelectedIndices(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <Box sx={{ backgroundColor: '#f0f4f8', py: 5 }}>
      <Grid container spacing={4}>
        {/* 上传图片部分 */}
        <Grid item xs={12}>
          <Card sx={{ backgroundColor: '#ffffff', boxShadow: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" color="textSecondary">上传图片</Typography>
              <Box mt={2}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ marginBottom: '20px' }}
                />
                {selectedImage && (
                  <Box mt={2}>
                    <img
                      src={selectedImage}
                      alt="Selected"
                      style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
                    />
                  </Box>
                )}
              </Box>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRecognition}
                  disabled={!selectedImage || loading}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : '识别'}
                </Button>
              </Box>
              {error && (
                <Typography color="error" mt={2}>
                  {error}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 显示识别结果图片 */}
        {resultImage && (
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: '#ffffff', boxShadow: 3, borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" color="textSecondary">识别结果图片</Typography>
                <Box mt={2}>
                  <img
                    src={resultImage}
                    alt="Result"
                    style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* 表格部分 */}
      <Box mt={4}>
        {recognitionResults.length > 0 && (
          <>
            <Typography variant="h6" color="textSecondary" gutterBottom>识别结果 (表格形式):</Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Index (选中)</TableCell>
                  <TableCell>Polygon (四个坐标点)</TableCell>
                  <TableCell>Texts</TableCell>
                  <TableCell>Image</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recognitionResults.map((result, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIndices[idx] || false}
                        onChange={() => handleIndexCheckboxChange(idx)}
                      />
                      {result.index}
                    </TableCell>
                    <TableCell>
                      {result.polygon.map((point, pointIndex) => (
                        <span key={pointIndex}>
                          ({point[0].toFixed(2)}, {point[1].toFixed(2)})
                          {pointIndex < result.polygon.length - 1 && ', '}
                        </span>
                      ))}
                    </TableCell>
                    <TableCell>
                      {Array.isArray(result.texts) ? result.texts.join(', ') : result.texts}
                    </TableCell>
                    <TableCell>
                      {result.image && (
                        <img
                          src={result.image}
                          alt={`Result ${result.index}`}
                          style={{ maxWidth: '100px', height: 'auto', borderRadius: '4px' }}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </Box>
    </Box>
  );
}

export default ImageRecognition;
