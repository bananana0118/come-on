/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

import { Box, Button, Typography } from "@mui/material"

import { AccountCircleOutlined, DateRange, Share } from "@mui/icons-material"

import { styled } from "@mui/material/styles"
import MapContainer from "components/common/course/MapContainer"
import KakaoShare from "components/KakaoShare"
import { generateComponent } from "utils"
import KakaoIcon from "assets/nav/KakaoIcon"
import LikeButton from "components/common/card/cardLayout/CardItemButton"
import {
  useClickLikeCourseMutation,
  useGetCourseDetailQuery,
} from "features/course/courseSlice"
import PlaceDetailCard from "components/common/card/PlaceDetailCard"
import CourseNextStepButton from "components/user/course/CourseNextStepButton"

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

const KakaoContainer = styled(Box)(() => ({
  display: "flex",
  justifyContent: "right",
  alignItems: "center",
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
  lineHegiht: "145%",
  margin: "10px 0",
  display: "flex",
  flexWrap: "nowrap",
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

enum PlaceType {
  m = "meeting",
  c = "course",
}

const CoursePage = (): JSX.Element => {
  const [selectedNumber, setselectedNumber] = useState<string>("")
  const [imgSrc, setImgSrc] = useState<string>("")
  const { id } = useParams<string>()

  const {
    data: resultCourseDetail,
    isSuccess,
    isLoading,
    isFetching,
  } = useGetCourseDetailQuery(id)
  const [clickLikeCourse] = useClickLikeCourseMutation()
  const loadData = resultCourseDetail?.data?.coursePlaces
  const imgUrl = resultCourseDetail?.data?.imageUrl
  const initialLike = resultCourseDetail?.data?.userLiked!
  let likecount = resultCourseDetail?.data?.likeCount!
  const [isLike, setIsLike] = useState<boolean>(initialLike)
  let likeCount = likecount

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
              isLoading={isLoading}
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