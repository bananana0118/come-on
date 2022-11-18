/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import { generateComponent } from "utils"
import { Box, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"

import KakaoShare from "components/KakaoShare"
import MapContainer from "components/common/course/MapContainer"
import PlaceDetailCard from "components/common/card/PlaceDetailCard"
import { AccountCircleOutlined, DateRange } from "@mui/icons-material"
import LikeButton from "components/common/card/cardLayout/CardItemButton"
import CourseNextStepButton from "components/user/course/CourseNextStepButton"
import {
  useClickLikeCourseMutation,
  useGetCourseDetailQuery,
} from "features/course/courseSlice"
import { PlaceType } from "types/API/course-service"

const TitleContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}))

const MainContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}))

const ImgContainer = styled(Box)(() => ({
  width: "100%",
  height: "200px",
  overflow: "hidden",
  position: "relative",
}))

const FONT_TITLE = {
  fontSize: "22px",
  fontWeight: "bold",
  margin: "auto 0",
}
const FONT_SUBTITLE = {
  fontSize: "13px",
  lineHeight: "145%",
  color: "#9E9E9E",
}

const ICON_BOX = {
  lineHegiht: "145%",
  margin: "0 auto",
  display: "flex",
  flexWrap: "nowrap",
  justifyContent: "flex-start",
  alignItems: "center",
}

const ICON_STYLE = {
  width: "16px",
  height: "16px",
}

const SUBTITLE = {
  margin: "10px 0",
  display: "flex",
  flexWrap: "nowrap",
  lineHegiht: "145%",
  justifyContent: "flex-start",
}

const TITLE = {
  width: "100%",
  display: "flex",
  marginTop: "10px",
  justifyContent: "space-between",
}

const DES_STYLE = {
  height: "80px",
  fontSize: "14px",
  lineHeight: "140%",
  color: "#616161",
}
interface CoursePlaceState {
  order: number
  name: string
  description: string
  lng: number // 경도 x
  lat: number // 위도 y
  apiId: number
  category: string
  id: number
  address: string
}

interface errorType {
  data: {
    code: string
    data: {
      errorCode: number
      message: string
      responseTime: string
    }
  }
  status: number
}

const CoursePage = (): JSX.Element => {
  const [selectedNumber, setselectedNumber] = useState<string>("")
  const [imgSrc, setImgSrc] = useState<string>("")
  const { id } = useParams<string>()

  const {
    data: resultCourseDetail,
    isSuccess,
    isFetching,
    error: err,
  } = useGetCourseDetailQuery(id)
  const [clickLikeCourse] = useClickLikeCourseMutation()
  const loadData = resultCourseDetail?.data?.coursePlaces
  const imgUrl = resultCourseDetail?.data?.imageUrl
  const initialLike = resultCourseDetail?.data?.userLiked!
  let likecount = resultCourseDetail?.data?.likeCount!
  const [isLike, setIsLike] = useState<boolean>(initialLike)
  let likeCount = likecount
  const navigate = useNavigate()

  if (err && "data" in err) {
    // eslint-disable-next-line no-empty

    const error = err as errorType
    const { errorCode } = error.data.data
    switch (errorCode) {
      case 904:
        navigate("/not-found", {
          state: { content: "죄송합니다. 저장되지 않은 코스입니다." },
        })
        break
      case 905:
        navigate("/not-found", {
          state: { content: "요청을 수행할 권한이 없습니다." },
        })
        break
      case 906:
        navigate("/not-found", {
          state: { content: "해당 리소스에 접근할 수 없는 상태입니다." },
        })
        break
      case 907:
        navigate("/not-found", {
          state: { content: "인증된 사용자만 이용 가능합니다." },
        })
        break

      default:
        break
    }
  }

  const onClickFocus = (event: React.MouseEvent<HTMLDivElement>): void => {
    const e = event?.currentTarget

    if (e) {
      setselectedNumber(e.id)
    } else {
      setselectedNumber("")
    }
  }
  const changeLikeCount = (): number => {
    if (isSuccess)
      if (isLike) return likeCount! + 1
      else if (isLike === false && likeCount! > 0) return likeCount! - 1
    return likeCount
  }

  let courseData: CoursePlaceState[] = []
  const onRemove = (index: number): void => {
    courseData = courseData?.filter((place) => place.order !== index)
  }

  const onClickLike = async (courseId: number): Promise<void> => {
    const a = await clickLikeCourse(courseId).unwrap()
    setIsLike(a.data.userLiked)
  }

  useEffect(() => {
    if (isSuccess) {
      setImgSrc(imgUrl!)
    }
  }, [isSuccess, imgUrl])

  let content
  // eslint-disable-next-line no-empty
  if (isFetching) {
  } else if (isSuccess) {
    content = (
      <>
        <ImgContainer>
          <img
            src={imgSrc}
            width="100%"
            height="auto"
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            alt="img"
          />
        </ImgContainer>
        <MainContainer style={{ margin: "auto 20px" }}>
          <TitleContainer>
            <Box className="Title" sx={TITLE}>
              <Typography variant="h5" sx={FONT_TITLE}>
                {resultCourseDetail?.data?.title}
              </Typography>
              {resultCourseDetail && (
                <LikeButton
                  isLike={isLike!}
                  courseId={Number(id)}
                  onClickHandler={(courseId) => {
                    onClickLike(Number(courseId))
                  }}
                  likeCount={changeLikeCount()}
                />
              )}
            </Box>
            <Box className="subTitle" sx={SUBTITLE}>
              <Typography variant="subtitle1" sx={FONT_SUBTITLE}>
                <Box sx={ICON_BOX}>
                  <AccountCircleOutlined sx={ICON_STYLE} />
                  {resultCourseDetail?.data?.writer.nickname}
                  <Typography
                    variant="subtitle1"
                    sx={FONT_SUBTITLE}
                    style={{ margin: "auto 5px" }}
                  >
                    |
                  </Typography>
                  <DateRange sx={ICON_STYLE} />
                  {resultCourseDetail?.data?.updatedDate}
                </Box>
              </Typography>
            </Box>
          </TitleContainer>
          <Box sx={DES_STYLE}>{resultCourseDetail?.data?.description}</Box>
          {loadData !== null && loadData !== undefined && (
            <MapContainer
              selectedNumber={String(selectedNumber)}
              placeLists={loadData}
              isSuccess={isSuccess}
            />
          )}

          {/* 버튼만들기 */}
          {loadData !== null &&
            loadData !== undefined &&
            generateComponent(loadData, (item, key) => (
              <PlaceDetailCard
                item={item}
                key={key}
                onClick={onClickFocus}
                isSelected={
                  item.order ===
                  (selectedNumber === "" ? -10 : Number(selectedNumber))
                }
                onRemove={onRemove}
                maxLen={loadData.length}
                mode={PlaceType.c}
                isEditable={false}
              />
            ))}
          <KakaoShare
            name={resultCourseDetail?.data?.writer.nickname}
            title={resultCourseDetail?.data?.title}
            content={resultCourseDetail?.data?.description}
            imageUrl={imgSrc}
            courseId={Number(id)}
          />
          <CourseNextStepButton
            content="이 코스로 모임 생성하기"
            isValid
            onClick={() => console.log("모임생성")}
          />

          {/* 공유하기 버튼 만들기 클릭시 post 요청으로 코스 등록 => 모임생성 페이지로 감 */}
        </MainContainer>
      </>
    )
  }
  return <div>{content}</div>
}

export default CoursePage
