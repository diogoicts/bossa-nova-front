import React, { useEffect, useState } from 'react';
import Popup from 'reactjs-popup';

import { MdAdd, MdClear, MdSearch } from 'react-icons/md'

import {
  Container, Content, Header, Actions, Search, AddTool, Body, LoadingArea,
  MessageArea, Tools, Tool, ToolHeader, ToolTags
} from './styles';

import api_tools from '../../services/api_tools';
import { toast } from 'react-toastify';

import Loading from '../../components/Loading'
import CheckboxLabels from '../../components/Checkbox'

import * as formik from 'formik';
import * as yup from 'yup';

const Main = () => {

  const { Formik } = formik;

  // Inner states
  const [tools, setTools] = useState([])
  const [bodyLoading, setBodyLoading] = useState(false)
  const [bodyMessage, setBodyMessage] = useState('')
  const [search, setSearch] = useState('')
  const [inLogs, setInLogs] = useState(false)

  const [adding, setAdding] = useState(false)
  const [formError, setFormError] = useState(false)

  // Modal Form - Schema
  const schema = yup.object({
    toolName: yup.string().required('tool name is a required field'),
    toolLink: yup.string().required('tool link is a required field'),
    toolDescription: yup.string().required('tool description is a required field'),
    toolTags: yup.string().required('tool tags is a required field'),
  })


  // Functions

  function handleSearch() {

    const query_string = inLogs ?
      `?tags_like=${search}`
      :
      `?q=${search}`

    search ?
      getTools(query_string)
      :
      getTools('')
  }

  function handleAddTool(values) {
    const { toolDescription, toolLink, toolName, toolTags } = values

    const body = {
      title: toolName,
      link: toolLink,
      description: toolDescription,
      tags: toolTags
    }

    addTool(body)
  }

  // API Calls
  async function getTools(query_string) {

    setBodyLoading(true)
    setBodyMessage('')

    try {

      const response = await api_tools.get(`/tools${query_string}`)

      if (response.data) {
        setTools(response.data)
      } else {
        setBodyLoading('Unexpected error')
      }

    } catch (error) {
      toast.error('Error')
      setBodyLoading('Unable to load devices')
    }

    setBodyLoading(false)
  }

  async function addTool(body) {
    setAdding(true)
    setFormError('')

    try {

      const response = await api_tools.post(`/tools`, body)

      if (response.data) {
        toast.info('Tool successfully added')
        getTools('')
      }

    } catch (e) {
      toast.error('An error occurred')
      setFormError('Unable to connect to server')

      const error = e.response?.data

      if (error) {
        if (error.statusCode === 409) {
          setFormError('Subgroup name already exists')
        }
        else if (error.statusCode === 500) {
          setFormError('An unexpected error occurred')
        }
      }

    }

    setAdding(false)
  }

  // USE EFFECTS
  useEffect(() => {
    handleSearch()
  }, [search, inLogs])


  return (
    <Container>
      <Content>
        <Header>
          <h1>VUTTR</h1>
          <h4>Very Useful Tools to Remember</h4>
        </Header>
        <Actions>
          <Search>
            <div>
              <MdSearch />
              <input
                placeholder='search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <CheckboxLabels value={inLogs} label='search in logs only' func={setInLogs} />
          </Search>
          <Popup
            trigger={
              <button>
                <MdAdd />
                Add
              </button>
            }
            modal
          >
            {
              close => {
                return (
                  <AddTool formError={formError} adding={adding}>

                    <div className='add-tool-header'>
                      <MdAdd />
                      Add new tool
                    </div>

                    <div>
                      <span>{formError}</span>
                    </div>

                    <Formik
                      validateOnChange={false}
                      validateOnBlur={false}
                      validationSchema={schema}
                      onSubmit={(values) => {
                        console.log(values)
                        handleAddTool(values)
                      }}
                      initialValues={{}}
                    >
                      {({
                        handleSubmit,
                        handleChange,
                        handleBlur,
                        values,
                        touched,
                        isValid,
                        errors,
                      }) => (
                          <form noValidate onSubmit={handleSubmit}>
                            <div className='add-tool-item'>
                              <h4>Tool Name</h4>
                              <div>
                                <input
                                  type='text'
                                  name='toolName'
                                  placeholder=''
                                  value={values.toolName}
                                  onChange={handleChange}
                                  className={errors && errors.toolName ? 'input-error' : ''}
                                />
                                <p>{errors && errors.toolName}</p>
                              </div>
                            </div>
                            <div className='add-tool-item'>
                              <h4>Tool Link</h4>
                              <div>
                                <input
                                  type='text'
                                  name='toolLink'
                                  placeholder=''
                                  value={values.toolLink}
                                  onChange={handleChange}
                                  className={errors && errors.toolLink ? 'input-error' : ''}
                                />
                                <p>{errors && errors.toolLink}</p>
                              </div>
                            </div>
                            <div className='add-tool-item'>
                              <h4>Tool description</h4>
                              <div>
                                <textarea
                                  type='text'
                                  name='toolDescription'
                                  placeholder=''
                                  value={values.toolDescription}
                                  onChange={handleChange}
                                  className={errors && errors.toolDescription ? 'input-error' : ''}
                                />
                                <p>{errors && errors.toolDescription}</p>
                              </div>
                            </div>
                            <div className='add-tool-item'>
                              <h4>Tags</h4>
                              <div>
                                <input
                                  type='text'
                                  name='toolTags'
                                  placeholder=''
                                  value={values.toolTags}
                                  onChange={handleChange}
                                  className={errors && errors.toolTags ? 'input-error' : ''}
                                />
                                <p>{errors && errors.toolTags}</p>
                              </div>
                            </div>
                            <div className='buttons'>
                              <button type='submit'>
                                Add tool
                              </button>
                            </div>
                          </form>
                        )}
                    </Formik>


                  </AddTool>
                )
              }
            }
          </Popup>
        </Actions>
        <Body>
          {
            bodyLoading ?
              <LoadingArea>
                <Loading />
              </LoadingArea>

              :
              bodyMessage ?
                <MessageArea>
                  {bodyMessage}
                </MessageArea>
                :
                <Tools>
                  {
                    tools && Array.isArray(tools) && tools.map(tool => {

                      const link = tool.link
                      const title = tool.title
                      const description = tool.description
                      const tags = tool.tags

                      return (
                        <Tool>
                          <ToolHeader>
                            <a href={link}>
                              {title}
                            </a>

                            <div>
                              <MdClear />
                              remove
                            </div>

                          </ToolHeader>
                          <p>
                            {description}
                          </p>
                          <ToolTags>
                            {
                              tags && Array.isArray(tags) && tags.map(tag => {

                                return (
                                  <span>{`#${tag}`}</span>
                                )
                              })
                            }
                          </ToolTags>
                        </Tool>
                      )
                    })
                  }
                </Tools>
          }
        </Body>
      </Content>
    </Container>
  );
}

export default Main;