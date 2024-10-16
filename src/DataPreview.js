import React, { useState, useEffect } from 'react';
import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import axios from 'axios';

const backendUrl = process.env.REACT_APP_API_URL;

function DatasetPreview({ datasetName }) {
  const [dataList, setDataList] = useState([]); // 用于存储标注数据
  const [selectedImageId, setSelectedImageId] = useState(null); // 用于存储当前选择的图片ID

  // 获取数据集的标注数据
  useEffect(() => {
    axios.get(`${backendUrl}/datasets/annotations/${datasetName}`) // 替换为你的后端 API URL
      .then((response) => {
        setDataList(response.data);
      })
      .catch((error) => {
        console.error('获取标注数据失败:', error);
      });
  }, [datasetName]);

  return (
    <Box sx={{ padding: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        {`数据集 ${datasetName} 的预览`}
      </Typography>

      {/* 预览已标注的图片 */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 4 }}>
        {dataList.map((item) => (
          <Box
            key={item.id}
            sx={{
              cursor: 'pointer',
              border: selectedImageId === item.id ? '2px solid blue' : '1px solid gray',
              padding: '4px',
              borderRadius: '4px',
            }}
            onClick={() => setSelectedImageId(item.id)}  // 设置点击事件来选择图片
          >
            <img
              src={`${backendUrl}${item.imagePath}`}
              alt={`PreviewImage-${item.id}`}
              style={{ maxWidth: '150px', height: 'auto', borderRadius: '4px' }}
            />
          </Box>
        ))}
      </Box>

      {/* 显示选中图片的标注条目 */}
      {selectedImageId && (
        <Box mt={4}>
          <Typography variant="h6">标注条目</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>标注</TableCell>
                  <TableCell>置信度</TableCell>
                  <TableCell>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dataList
                  .filter(item => item.id === selectedImageId)  // 只显示选中图片的标注信息
                  .map((item) => (
                    <TableRow key={item.id} style={{ opacity: item.deleted ? 0.5 : 1 }}>
                      <TableCell>{item.text}</TableCell>
                      <TableCell>{item.confidence}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => console.log('删除数据', item.id)}
                          disabled={item.deleted}
                          sx={{ mr: 1 }}
                        >
                          删除数据
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => console.log('恢复数据', item.id)}
                          disabled={!item.deleted}
                        >
                          恢复数据
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
}

export default DatasetPreview;
