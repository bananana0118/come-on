/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, {
  useState,
  SetStateAction,
  Dispatch,
  useEffect,
  useCallback,
} from "react"
import { useNavigate } from "react-router-dom"
import { MydetailRes } from "types/API/user-service"
import { toStringYyyymmdd, generateComponent } from "utils"

import { useMyDetailQuery } from "features/user/userSlice"
import { styled } from "@mui/material/styles"

import { Box, Typography } from "@mui/material"
import CourseNextStepButton from "components/user/course/CourseNextStepButton"

import { useDispatch, useSelector } from "react-redux"
import { fetchByIdCourseDetail } from "features/course/courseSlice"

import { Buffer } from "buffer"
import { RootState, AppDispatch } from "store"
import PlaceDetailCard from "components/common/card/PlaceDetailCard"
import { AccountCircleOutlined, DateRange } from "@mui/icons-material"

import MapContainer from "components/common/course/MapContainer"
import { QueryProps } from "components/common/BasicFrame/BasicFrame"
import { CoursePlaceProps, PlaceType } from "types/API/course-service"
import LikeButton from "components/common/card/cardLayout/CardItemButton"

const TitleContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
}))

const MainContainer = styled(Box)(() => ({
  display: "flex",
  margin: "0px 20px 16px 20px",
  flexDirection: "column",
  position: "relative",
  top: "-50px",
}))

const ImgContainer = styled(Box)(() => ({
  width: "100%",
  height: "230px",
  overflow: "hidden",
  position: "relative",
  marginBottom: "0px",
  top: "-60px",
}))

const FONT_TITLE = {
  fontSize: "22px",
  fontWeight: "bold",
  margin: "auto 0",
}

const FontSubtitle = styled(Typography)(
  ({
    theme: {
      grayscale,
      textStyles: {
        body2: { bold },
      },
    },
  }) => ({
    fontSize: bold.fontSize,
    lineHeight: bold.lineHeight,
    color: grayscale[500],
  })
)

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
  justifyContent: "space-between",
  alignItems: "center",
}

const DesText = styled(Typography)(
  ({
    theme: {
      grayscale,
      textStyles: {
        body1: { bold },
      },
    },
  }) => ({
    fontSize: bold.fontSize,
    lineHeight: bold.lineHeight,
    color: grayscale[700],
    margin: "auto 5px",
  })
)

window.Buffer = Buffer

interface pageProps {
  page: number
  id: number
  setPage: Dispatch<SetStateAction<number>>
}

// 코스등록 전 미리보기 페이지
const CourseEditDetail3 = ({ id, setPage, page }: pageProps): JSX.Element => {
  const navigate = useNavigate()
  interface MyDetailQueryProps extends QueryProps {
    data: MydetailRes
  }
  const dispatch = useDispatch<AppDispatch>()
  const [selectedNumber, setselectedNumber] = useState<string>("")
  const [courseIdProps, setCourseIdProps] = useState<number>()
  const { data: userData, isLoading: isLoadingUser } =
    useMyDetailQuery() as MyDetailQueryProps

  const courseDetail = useSelector((state: RootState) => {
    return state.course.courseDetails
  })
  const placeList: CoursePlaceProps[] = useSelector((state: RootState) => {
    return state.course.coursePlaces
  })

  const onClickFocus = (event: React.MouseEvent<HTMLDivElement>): void => {
    const e = event?.currentTarget
    if (e) {
      setselectedNumber(e.id)
    } else {
      setselectedNumber("")
    }
  }

  const dis = useCallback(async () => {
    const loadData = await dispatch(fetchByIdCourseDetail(id))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const myData: any = loadData.payload
  }, [dispatch, id])

  useEffect(() => {
    if (page === 4) dis()
  }, [dis, page])

  const [isLike, setIsLike] = useState<boolean>(true)
  let likeCount = 999

  const changeLikeCount = (): number => {
    if (isLike) return likeCount + 1
    return likeCount
  }

  const onClickLike = (): void => {
    setIsLike(!isLike)
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    likeCount = changeLikeCount()
  }, [isLike])
  // 제출
  const submit = (courseId: number): void => {
    navigate(`/course/${courseId}`)
  }

  if (isLoadingUser) return <div>Loading...</div>
  return (
    courseDetail && (
      <>
        <ImgContainer>
          <img
            src={courseDetail.imgFile}
            width="100%"
            height="auto"
            style={{
              position: "absolute",
              zIndex: "-10",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            alt="img"
          />
        </ImgContainer>
        <MainContainer>
          <TitleContainer>
            <Box className="Title" sx={TITLE}>
              <Typography variant="h5" sx={FONT_TITLE}>
                {courseDetail?.title}
              </Typography>
              {likeCount && (
                <LikeButton
                  isLike={isLike!}
                  courseId={0}
                  onClickHandler={() => {
                    onClickLike()
                  }}
                  likeCount={changeLikeCount()}
                />
              )}
            </Box>
            <Box className="subTitle" sx={SUBTITLE}>
              <FontSubtitle>
                <Box sx={ICON_BOX}>
                  <AccountCircleOutlined sx={ICON_STYLE} />
                  <FontSubtitle>{userData.data.nickname}</FontSubtitle>
                  <DateRange sx={ICON_STYLE} />
                  {toStringYyyymmdd(new Date())}
                </Box>
              </FontSubtitle>
            </Box>
          </TitleContainer>
          <Box>
            <DesText>{courseDetail?.description}</DesText>
          </Box>
          {placeList !== null && placeList !== undefined && (
            <MapContainer
              selectedNumber={selectedNumber}
              placeLists={placeList}
              isSuccess
            />
          )}

          {placeList[0].order !== 0 &&
            generateComponent(placeList, (item, key) => (
              <PlaceDetailCard
                item={item}
                key={key}
                onClick={onClickFocus}
                isSelected={
                  item.order ===
                  (selectedNumber === "" ? -10 : Number(selectedNumber))
                }
                courseId={courseIdProps}
                maxLen={placeList.length}
                mode={PlaceType.c}
                isEditable={false}
              />
            ))}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <CourseNextStepButton
              content="수정완료"
              width="100%"
              onClick={() => {
                submit(id)
              }}
              isValid
            />
          </Box>
        </MainContainer>
      </>
    )
  )
}
export default CourseEditDetail3
