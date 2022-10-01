import React, {
  useState,
  useRef,
  useEffect,
  SetStateAction,
  Dispatch,
} from "react"

import { styled } from "@mui/material/styles"

import { Box } from "@mui/material"
import CourseNextStepButton from "components/user/course/CourseNextStepButton"

import { useSelector } from "react-redux"
import { RootState } from "store"
import {
  useAddCoursePlaceMutation,
  useAddCourseDetailMutation,
} from "features/course/courseSlice"

import { Buffer } from "buffer"

window.Buffer = Buffer

const b64toBlob = (
  b64Data: string,
  contentTypeProps: string,
  sliceSizeProps?: number
): Blob => {
  const contentType = contentTypeProps || ""
  const sliceSize = sliceSizeProps || 512

  const byteCharacters = Buffer.from(b64Data, "base64").toString()
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)

    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i += 1) {
      byteNumbers[i] = slice.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)

    byteArrays.push(byteArray)
  }

  const myBlob = new Blob(byteArrays, { type: contentType })
  return myBlob
}

const dataUrlToFile = (dataUrl: string, filename: string): File | undefined => {
  const arr = dataUrl.split(",")
  if (arr.length < 2) {
    return undefined
  }
  const mimeArr = arr[0].match(/:(.*?);/)
  if (!mimeArr || mimeArr.length < 2) {
    return undefined
  }
  const mime = mimeArr[1]
  const buff = Buffer.from(arr[1], "base64")
  return new File([buff], filename, { type: mime })
}
interface pageProps {
  page: number
  setPage: Dispatch<SetStateAction<number>>
}

// 코스등록 전 미리보기 페이지
const CourseRegiDetail3 = ({ setPage, page }: pageProps): JSX.Element => {
  const mapContainer = useRef<HTMLDivElement>(null) // 지도를 표시할 div
  const ImgContainer = styled(Box)(() => ({
    margin: "0",
    padding: "0",
    width: "100%",
    height: "180px",
    objectFit: "cover",
  }))

  setPage(page)

  const MainContainer = styled(Box)(() => ({
    padding: "0px 20px",
    display: "flex",
    flexDirection: "column",
  }))

  /* **********************************************************************

api연동부분
 2
************************************************************************** */

  const [addCourseDetail, { data: result, isSuccess }] =
    useAddCourseDetailMutation()
  const [addCoursePlace, { data: courseResult }] = useAddCoursePlaceMutation()

  const courseDetail = useSelector((state: RootState) => {
    return state.course.courseDetails
  })

  const [onSubmit, setOnSubmit] = useState<boolean>(true)

  // 제출용 폼데이터 만드는 함수
  // base64 => File => blob으로 만들었다.
  const makeFormData = (blobImgFile: Blob): FormData => {
    const formData = new FormData()
    formData.append("title", courseDetail.title)
    formData.append("description", courseDetail.description)
    const myfile = dataUrlToFile(courseDetail.imgFile, "코스화면.png")

    if (myfile !== undefined) {
      myfile?.arrayBuffer().then((arrayBuffer) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const blob = new Blob([new Uint8Array(arrayBuffer)], {
          type: myfile.type,
        })
      })
      formData.append("imgFile", myfile)
    }

    return formData
  }
  let courseId: number | undefined
  // async (): Promise<boolean>
  // 코스 디테일 전송하는 함수
  const submitCourseDetail = async (): Promise<boolean> => {
    const { imgFile } = courseDetail
    const base64str = imgFile.split(",")
    const contentTypeProps = base64str[0]
    const b64Data = base64str[1]
    const imageBlob = b64toBlob(b64Data, contentTypeProps)
    try {
      const submitData = makeFormData(imageBlob)
      await addCourseDetail(submitData)

      if (isSuccess) {
        const res = result
        courseId = res?.data.courseId
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log("%s", err)
    }
    return Promise.resolve(true)
  }

  const courseList = useSelector((state: RootState) => {
    return state.course.coursePlaces
  })

  const initialPlace = {
    order: 1,
    name: "newName",
    description: "값을 입력해주세요",
    lng: 38.05248142233915, // 경도 x
    lat: 127.65930674808553, // 위도 y
    apiId: 12346,
    category: "ETC",
  }

  const postData = {
    toSave: [initialPlace],
    // toModify: [{ ...initialPlace, coursePlaceId: courseId }],
    // toDelete: [{ coursePlaceId: courseId }],
  }

  // // 장소리스트 전송하는 함수
  const submitPlaceList = async (): Promise<boolean> => {
    // map으로 toSave배열에 코스 추가하기
    // toSave 전처리
    postData.toSave.pop() // 첫번쨰 데이터 삭제
    courseList.map((place) => postData.toSave.push(place))

    await addCoursePlace({ courseId, postData })

    return Promise.resolve(true)
  }

  useEffect(() => {
    const submit = async (): Promise<boolean> => {
      await submitCourseDetail()
      if (isSuccess) {
        await submitPlaceList()
      }
      return Promise.resolve(true)
    }

    submit()
    setOnSubmit(false)
  }, [onSubmit, isSuccess, submitCourseDetail])

  return (
    <MainContainer>
      {/*       
        /* 코스 이름
  코스 날짜
  }
{
  코스사진
  코스설명
      */}
      <div>사진찍기 좋은 부산 여행 코스</div>
      <div>여행마스터</div>
      <div>2022-09-15</div>

      <ImgContainer>
        <img src={courseDetail.imgFile} width="100%" height="100%" alt="img" />
      </ImgContainer>
      <div>코스설명</div>
      <div>이 코스에선 귀여운 뱁새를 볼 수 있습니다.</div>

      {/*  맵컨테이너
맵 리스트 */}
      <div
        id="map"
        ref={mapContainer}
        style={{ width: "100%", height: "20rem" }}
      />
      <CourseNextStepButton
        content="코스등록 완료하기"
        onClick={() => {
          setOnSubmit(true)
        }}
      />
    </MainContainer>
  )
}
export default CourseRegiDetail3
