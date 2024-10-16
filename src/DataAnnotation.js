import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, TextField, MenuItem, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import axios from 'axios';
import DatasetPreview from './DataPreview';
const backendUrl = process.env.REACT_APP_API_URL;

function DataAnnotation() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [dataList, setDataList] = useState([]);
  const [datasetList, setDatasetList] = useState([]); // 用于存储所有数据集
  const [selectedDataset, setSelectedDataset] = useState(''); // 当前选择的数据集
  const [newDatasetName, setNewDatasetName] = useState(''); // 新创建的数据集名称

  // 获取数据集列表
  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = () => {
    axios.get('/dataset/datasets') // 获取数据集列表的 API
      .then((response) => {
        setDatasetList(response.data);
      })
      .catch((error) => {
        console.error('获取数据集失败:', error);
      });
  };

  const handleCreateDataset = () => {
    if (newDatasetName) {
      axios.post('/dataset/create', { name: newDatasetName }) // 创建数据集的 API
        .then(() => {
          fetchDatasets(); // 刷新数据集列表
          setNewDatasetName('');
        })
        .catch((error) => {
          console.error('创建数据集失败:', error);
        });
    }
  };

  const handleDeleteDataset = (name) => {
    axios.post('/dataset/delete', { name }) // 删除数据集的 API
      .then(() => {
        fetchDatasets(); // 刷新数据集列表
        setSelectedDataset(''); // 清除选择的当前数据集
        setDataList([]); // 清除当前展示的标注数据
      })
      .catch((error) => {
        console.error('删除数据集失败:', error);
      });
  };

  const handleSelectDataset = (name) => {
    setSelectedDataset(name);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageSrc = reader.result;
        setSelectedImage(imageSrc); // 显示上传的图片
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAutoAnnotation = () => {
    if (!selectedImage || !selectedDataset) {
      alert('请先上传图片并选择数据集');
      return;
    }

    axios
      .post('/dataset/annotate', { image: selectedImage, dataset: selectedDataset }) // 上传并标注的 API
      .then((response) => {
        const annotatedData = response.data;

        // 更新后的数据是每个裁剪后的区域图像及其标注信息
        const updatedDataList = annotatedData.map((item) => ({
          id: item.id,
          imagePath: item.image_path,  // 裁剪后的文字区域图片路径
          text: item.text,             // 文字内容
          coordinates: item.coordinates, // 文字区域坐标
          confidence: item.confidence, // 置信度
          deleted: false,
        }));

        setDataList([...dataList, ...updatedDataList]); // 将新数据追加到已有的数据集中
      })
      .catch((error) => {
        console.error('自动化标注失败:', error);
      });
  };

  const handleDelete = (id) => {
    setDataList((prevList) =>
      prevList.map((item) => (item.id === id ? { ...item, deleted: true } : item))
    );
  };

  const handleRestore = (id) => {
    setDataList((prevList) =>
      prevList.map((item) => (item.id === id ? { ...item, deleted: false } : item))
    );
  };

  const handleConfirmDelete = () => {
    const idsToDelete = dataList.filter(item => item.deleted).map(item => item.id);
    axios.post('/dataset/delete_annotations', { ids: idsToDelete }) // 删除标注数据的 API
      .then(() => {
        setDataList(prevList => prevList.filter(item => !item.deleted)); // 从前端移除被删除的数据
      })
      .catch(error => {
        console.error('删除失败:', error);
      });
  };

  return (
    <Box sx={{ padding: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        数据集管理与标注
      </Typography>

      {/* 数据集管理部分 */}
      <Box mb={4}>
        <Typography variant="h6">数据集管理</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          <TextField
            label="新数据集名称"
            value={newDatasetName}
            onChange={(e) => setNewDatasetName(e.target.value)}
            size="small"
            sx={{ marginRight: 2 }}
          />
          <Button variant="contained" color="primary" onClick={handleCreateDataset}>
            创建数据集
          </Button>
        </Box>
        <Box>
        <Typography>选择数据集</Typography>
        <TextField
          select
          label="选择数据集"
          value={selectedDataset}
          onChange={(e) => handleSelectDataset(e.target.value)}
          size="small"
          sx={{ width: '200px', marginRight: 2 }}
        >
          {datasetList.map((dataset) => (
            <MenuItem key={dataset.id} value={dataset.name}>
              {dataset.name}  {/* 显示数据集名称 */}
            </MenuItem>
          ))}
        </TextField>
        {selectedDataset && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => handleDeleteDataset(selectedDataset)}
          >
            删除数据集
          </Button>
        )}
      </Box>

      </Box>
      <DatasetPreview datasetName={selectedDataset} />
      {/* 数据标注部分 */}
      {selectedDataset && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </Box>
          {selectedImage && (
            <Box mt={2} sx={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={selectedImage}
                alt="Selected"
                style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <Button variant="contained" color="primary" onClick={handleAutoAnnotation}>
              自动化标注
            </Button>
          </Box>

          {/* 将标注数据展示为表格 */}
          <Box mt={4}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>图片</TableCell>
                    <TableCell>标注</TableCell>
                    <TableCell>置信度</TableCell>
                    <TableCell>操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataList.map((item) => (
                    <TableRow sx={{ height: 'auto' }} key={item.id} style={{ opacity: item.deleted ? 0.5 : 1 }}>
                      <TableCell sx={{ padding: '2px' }}>
                        <img
                          src={`${backendUrl}${item.imagePath}`}
                          alt={`CroppedImage-${item.id}`}
                          style={{ maxWidth: '100px', height: 'auto' }}
                        />
                      </TableCell>
                      <TableCell sx={{ padding: '2px' }}>{item.text}</TableCell>
                      <TableCell sx={{ padding: '2px' }}>{item.confidence}</TableCell>
                      <TableCell sx={{ padding: '2px' }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={() => handleDelete(item.id)}
                          disabled={item.deleted}
                          sx={{ mr: 1 }}
                        >
                          删除数据
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => handleRestore(item.id)}
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

          {/* 删除按钮 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <Button variant="contained" color="secondary" onClick={handleConfirmDelete}>
              确认删除
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}

export default DataAnnotation;
