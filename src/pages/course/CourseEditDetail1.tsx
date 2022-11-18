/* eslint-disable no-console */
import React, {
  Dispatch,
  SetStateAction,
  useState,
  useEffect,
  useCallback,
} from "react"
import {
  fetchByIdCourseDetail,
  setCourseDetail,
  useUpdateCourseDetailMutation,
} from "features/course/courseSlice"

import { AppDispatch } from "store"
import { useDispatch } from "react-redux"

import { Grid } from "@mui/material"
import { fileToObjectUrl } from "utils"
import TextInput from "components/common/input/TextInput"
import ImageInput from "components/common/input/ImageInput"
import CourseNextStepButton from "components/user/course/CourseNextStepButton"

interface pageProps {
  page: number
  id: number
  setPage: Dispatch<SetStateAction<number>>
}

const MAIN_CONTAINER = {
  padding: "20px",
}

const Test = ({ id, setPage, page }: pageProps): JSX.Element => {
  const dispatch = useDispatch<AppDispatch>()
  const [isValid, setIsValid] = useState(false)
  const [image, setImage] = useState<string>("")
  const [title, setTitle] = useState<string>("")
  const [imageFile, setImageFile] = useState<Blob>()
  const [description, setDescription] = useState<string>("")
  const [updateCourseDetail] = useUpdateCourseDetailMutation()

  const dis = useCallback(async () => {
    const detailData = await dispatch(fetchByIdCourseDetail(id))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myData: any = detailData.payload
    setDescription(myData.description)

    setTitle(myData.title)
    setImage(myData.imageUrl)
  }, [dispatch, id])

  useEffect(() => {
    if (page === 1) dis()
  }, [dis, page])

  const onValid = useCallback((): void => {
    if (title === "") return
    if (description === "") return
    if (image === "" || image === "undefined") return

    setIsValid(true)
  }, [description, image, title])

  const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const img = fileToObjectUrl(e.target.files[0])
      setImageFile(e.target.files[0])
      setImage(String(img))
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

    await updateCourseDetail({ id, data: newDetail })

    setPage(2)
  }

  useEffect(() => {
    onValid()
  }, [image, title, description, onValid])
  return (
    <Grid container spacing={3} sx={MAIN_CONTAINER}>
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
          maxLength={10}
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
          maxLength={30}
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
