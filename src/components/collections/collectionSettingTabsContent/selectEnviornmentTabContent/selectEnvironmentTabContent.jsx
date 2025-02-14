import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Joi from 'joi-browser';
import { Button, Tooltip, OverlayTrigger, Modal, Form, Dropdown } from 'react-bootstrap';
import { onCollectionUpdated, updateCollection } from '@/components/collections/redux/collectionsActions';
import { publishData } from '@/components/modals/redux/modalsActions';
import PublishSidebar from '@/components/publishSidebar/publishSidebar';
import { HiOutlineExternalLink } from 'react-icons/hi';
import { FiCopy } from 'react-icons/fi';
import { FaRegTimesCircle } from 'react-icons/fa';
import { RiCheckboxMultipleLine } from 'react-icons/ri';
import collectionsApiService from '@/components/collections/collectionsApiService';
import { toast } from 'react-toastify';
import IconButton from '@/components/common/iconButton';
import { MdDeleteOutline } from 'react-icons/md';
import { useParams } from 'next/navigation';

const SelectEnviornmentTabContent = (props) => {
  const { collections, environment, publicEnv, metaType } = useSelector((state) => ({
    collections: state.collections,
    environment: state.environment,
    publicEnv: state?.collections[state?.tabs?.activeTabId]?.environment,
    metaType: state?.organizations?.currentOrg?.meta?.type,
  }));

  const dispatch = useDispatch();

  const params = useParams();

  const collectionId = params.collectionId;

  const [loader, setLoader] = useState(false);
  const [republishNeeded, setRepublishNeeded] = useState(false);
  const [showCreateEnvForm, setShowCreateEnvForm] = useState(false);
  const [showCopyEnvModal, setShowCopyEnvModal] = useState(false);
  const [selectedEnv, setSelectedEnv] = useState(null);

  const [rows, setRows] = useState([
    { checked: false, variable: '', value: '', isEnabled: true },
    { checked: false, variable: '', value: '', isEnabled: true },
  ]);

  const handleAddRow = () => {
    setRows([...rows, { checked: false, variable: '', value: '', isEnabled: true }]);
  };

  const handleInputChange = (index, field, value) => {
    const updatedRows = rows.map((row, i) => (i === index ? { ...row, [field]: value } : row));
    setRows(updatedRows);
  };

  const handleToggleEnable = (index) => {
    const updatedRows = rows.map((row, i) => (i === index ? { ...row, isEnabled: !row.isEnabled } : row));
    setRows(updatedRows);
  };

  const handleSave = async () => {
    const formattedData = {};
    rows.forEach((row) => {
      if (row.variable) {
        formattedData[row.variable] = {
          currentValue: row.value,
          IsEditable: row.isEnabled,
          Checked: row.checked,
        };
      }
    });
    try {
      const response = await collectionsApiService.updateCollection(collectionId, {
        environment: formattedData,
        name: collections[collectionId].name,
      });
      dispatch(onCollectionUpdated(response.data));
      toast.success('Environment published successfully!');
    } catch {
      toast.error('Error!');
    }
    setShowCreateEnvForm(false);
  };

  const handleCopyExistingEnv = (environment) => {
    const copiedRows = Object.keys(environment?.variables).map((key) => ({
      variable: key,
      value: environment?.variables[key]?.initialValue || '',
      isEnabled: false,
      checked: false,
    }));

    setRows(copiedRows);
    setShowCopyEnvModal(false);
    setShowCreateEnvForm(true);
  };

  const handlePublicEnvClick = () => {
    const prefilledRows = Object.keys(publicEnv).map((key) => ({
      variable: key,
      value: publicEnv[key].currentValue,
      isEnabled: publicEnv[key].IsEditable,
      checked: publicEnv[key].Checked,
    }));
    setRows(prefilledRows);
    setShowCreateEnvForm(true);
  };

  const handleDeleteSelectedIndex = (collectionId, variable) => {
    const updatedRows = rows.filter((row) => row.variable !== variable);
    setRows(updatedRows);
  };

  const handleDelete = async (collectionId) => {
    try {
      const response = await collectionsApiService.updateCollection(collectionId, {
        environment: {},
        name: collections[collectionId].name,
      });
      dispatch(onCollectionUpdated(response.data));
      toast.success('Public Environment deleted successfully');
      setRows([
        { checked: false, variable: '', value: '', isEnabled: true },
        { checked: false, variable: '', value: '', isEnabled: true },
      ]);
      setShowCreateEnvForm(false);
    } catch (error) {
      throw error;
    }
  };

  return (
    <div className={`publish-on-tab p-4 ${props?.selectedTab === 8 ? '' : 'd-none'}`}>
      {Object.keys(environment.environments)?.length !== 0 && metaType !== 0 && (
        <div className='form-group mb-4'>
          <h3 className='mb-2'>Publish Environment</h3>
          <p className='text-secondary'>Publish environments at public API documentation.</p>
          {publicEnv === null || Object.keys(publicEnv || {})?.length === 0 ? (
            <Dropdown>
              <Dropdown.Toggle className='justify-content-between bg-white border w-100 font-12' variant='light' id='dropdown-basic'>
                {'Select Environment'}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {Object.keys(environment.environments).map((envId) => (
                  <Dropdown.Item
                    key={envId}
                    onClick={() => {
                      handleCopyExistingEnv(environment.environments[envId]);
                      setSelectedEnv(envId);
                    }}
                  >
                    {environment.environments[envId]?.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <input type='text border p-1 rounded cursor-pointer border rounded' className='d-block w-100 font-12' value='Public Environment' readOnly onClick={() => handlePublicEnvClick()} />
          )}
        </div>
      )}
      {showCreateEnvForm && (
        <Modal className='main-modal-contanier' show={showCreateEnvForm} onHide={() => setShowCreateEnvForm(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Public Environment</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form className='main-body-modal overflow-auto'>
              <table className='table my-0'>
                <thead>
                  <tr>
                    <th className='text-center'>
                      <Dropdown>
                        <IconButton>
                          <Dropdown.Toggle className='select-check p-0 bg-transparent text-dark border-0' id='dropdown-basic'>
                            Select
                          </Dropdown.Toggle>
                        </IconButton>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              setRows(
                                rows.map((row) => ({
                                  ...row,
                                  checked: true,
                                }))
                              )
                            }
                          >
                            Select All
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              setRows(
                                rows.map((row) => ({
                                  ...row,
                                  checked: false,
                                }))
                              )
                            }
                          >
                            Deselect All
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </th>
                    <th width={140}>Key</th>
                    <th>Value</th>
                    <th className='text-center'>
                      <Dropdown>
                        <IconButton>
                          <Dropdown.Toggle className='select-check p-0 bg-transparent text-dark border-0' variant='success' id='dropdown-basic'>
                            Editable
                          </Dropdown.Toggle>
                        </IconButton>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              setRows(
                                rows.map((row) => ({
                                  ...row,
                                  isEnabled: true,
                                }))
                              )
                            }
                          >
                            Editable All
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() =>
                              setRows(
                                rows.map((row) => ({
                                  ...row,
                                  isEnabled: false,
                                }))
                              )
                            }
                          >
                            Disable All
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </th>
                    <th className='text-center'>Delete</th>
                  </tr>
                </thead>
                <tbody height={100}>
                  {rows.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <Form.Check className='text-center pl-0' type='checkbox' checked={row.checked} onChange={(e) => handleInputChange(index, 'checked', e.target.checked)} />
                      </td>
                      <td>
                        <Form.Control className='key-input-field text-grey font-12' type='text' placeholder='Environment Key' value={row.variable} onChange={(e) => handleInputChange(index, 'variable', e.target.value)} />
                      </td>
                      <td>
                        <Form.Control className='text-grey' type='text' placeholder='Value' value={row.value} onChange={(e) => handleInputChange(index, 'value', e.target.value)} />
                      </td>
                      <td>
                        <Form>
                          <Form.Check className='text-center' type='switch' id={`custom-switch-${index}`} checked={row.isEnabled} onChange={() => handleToggleEnable(index)} />
                        </Form>
                      </td>
                      <td className='text-center public-environment-delete-icon cursor-pointer'>
                        <IconButton onClick={() => handleDeleteSelectedIndex(collectionId, row.variable)}>
                          <MdDeleteOutline className='text-grey p-1 rounded' size={24} />
                        </IconButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Form>
          </Modal.Body>
          <Modal.Footer className='justify-content-between'>
            <Button className='add-more-button text-grey bg-white font-12 border-0' onClick={handleAddRow}>
              + Add More Rows
            </Button>
            <div className='d-flex gap-2'>
              <button className='btn bg-primary text-white' onClick={handleSave}>
                Publish
              </button>
              <button className='btn bg-danger text-white' onClick={() => handleDelete(collectionId)}>
                Delete
              </button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default SelectEnviornmentTabContent;
