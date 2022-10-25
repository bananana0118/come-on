/* eslint-disable no-console */
import React, {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useCallback,
} from "react"
import { Grid } from "@mui/material"
import CourseNextStepButton from "components/user/course/CourseNextStepButton"

import TextInput from "components/common/input/TextInput"
import ImageInput from "components/common/input/ImageInput"

import {
  fetchByIdCourseDetail,
  setCourseDetail,
  useUpdateCourseDetailMutation,
} from "features/course/courseSlice"

import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "store"

import { useNavigate } from "react-router-dom"

interface pageProps {
  page: number
  id: number
  setPage: Dispatch<SetStateAction<number>>
}

const Test = ({ id, setPage, page }: pageProps): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>()
  const [image, setImage] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [updateCourseDetail, { data: res }] = useUpdateCourseDetailMutation()
  const navigate = useNavigate()

  // rtkq에서 데이터 불러오기
  // store에 데이터 저장하기

  // useEffect 써봤는데, 데이터를 못가져온다 => 여러번 호출하면, 기다려서 가져오거든요 ?
  // useEffect를 쓰면 여러번호출이 안된다. 왜냐하면 마운트 될때만 실행되거나
  // 값이 바뀔 때만 실행되기 때문에.
  const dis = useCallback(async () => {
    const detailData = await dispatch(fetchByIdCourseDetail(id))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myData: any = detailData.payload
    setDescription(myData.data.description)
    setTitle(myData.data.title)
    setImage(myData.data.imageUrl)
  }, [dispatch, id])

  useEffect(() => {
    if (page === 1) dis()
  }, [dis, page])

  const c = useSelector((state: RootState) => {
    return state.course.courseDetails
  })

  // 문제 : api의 pending이나 reject가 오면 mount 될 때 바인딩 할 수가 없음

  const [isValid, setIsValid] = useState(false)
  const [imageFile, setImageFile] = useState<Blob>()

  const onValid = useCallback((): void => {
    if (title === "") return
    if (description === "") return
    if (image === "" || image === "undefined") return
    setIsValid(true)
  }, [description, image, title])

  const convertURLtoFile = async (url: string): Promise<File> => {
    const response = await fetch(url)
    const data = await response.blob()
    const ext = url.split(".").pop() // url 구조에 맞게 수정할 것
    const filename = url.split("/").pop() // url 구조에 맞게 수정할 것
    const metadata = { type: `image/${ext}` }
    return new File([data], filename!, metadata)
  }

  const changeFileToObjectUrl = (file: File): string => {
    const fileUrl = URL.createObjectURL(file)

    console.log(fileUrl)
    return fileUrl
  }

  const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      console.log(e.target.files)
      const a = changeFileToObjectUrl(e.target.files[0])
      setImageFile(e.target.files[0])
      console.log(a)
      setImage(String(a))
    }
  }

  const handleChangeTitle = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setTitle(e.target.value)
  }

  const handleChangeDes = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setDescription(e.target.value)
  }

  const onClickNextPage = async (): Promise<void> => {
    const newDetail = new FormData()

    newDetail.append("title", title)
    newDetail.append("description", description)

    if (imageFile) {
      newDetail.append("imgFile", imageFile)
      dispatch(
        setCourseDetail({ title, description, imgFile: String(imageFile) })
      )
    } else {
      dispatch(setCourseDetail({ title, description, imgFile: String(image) }))
    }
    // 이미지가 바뀐 경우 base64로 바꿔서 전송

    await updateCourseDetail({ id, data: newDetail })
    console.log(res)
    // navigate(`/course/${id}/update`, { state: 2 })
    setPage(2)
  }

  useEffect(() => {
    onValid()
  }, [image, title, description, onValid])
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <ImageInput
          title="이미지 등록"
          alt="이미지를 등록해 주세요"
          message="이미지를 등록해 주세요"
          previewImg={image}
          handleChangeImg={onChangeImage}
        />
      </Grid>
      <Grid item xs={12}>
        <TextInput
          title="코스이름"
          name="title"
          value={title}
          placeholder="코스명을 입력해 주세요"
          handleChange={handleChangeTitle}
        />
      </Grid>
      <Grid item xs={12}>
        <TextInput
          multiline
          title="코스설명"
          placeholder="코스설명을 입력해주세요"
          rows={8}
          name="description"
          value={description}
          handleChange={handleChangeDes}
        />
      </Grid>
      <Grid item xs={12}>
        <CourseNextStepButton
          content="다음단계"
          isValid={isValid}
          onClick={() => onClickNextPage()}
        />
      </Grid>
    </Grid>
  )
}

export default Test
