/* eslint-disable no-nested-ternary */
import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"

import { styled } from "@mui/material/styles"
import { Box, LinearProgress, Typography } from "@mui/material"
import { Close, ArrowBackIosNewOutlined } from "@mui/icons-material"
import { PlaceType } from "types/API/course-service"
import CourseEditDetail1 from "pages/course/CourseEditDetail1"
import CourseEditDetail2 from "pages/course/CourseEditDetail2"
import CourseEditDetail3 from "pages/course/CourseEditDetail3"
import SearchPlace from "pages/course/SearchPlace"
// MUI

/* Course Layout 
날짜 : 2022-09-17
내용 : 사용자의 코스등록 진행정도에 따라 보여주는 내용을 변경합니다. 
       마지막 단계에서 api 요청과함께 서버로 데이터가 전송됩니다.
작성자 : 강예정
issue : 중간에 코스등록이 취소 될 시 데이터를 기억해서 다시 불러오는 기능을 추가할 수 있을지 고민 */

const NAVBAR_STYLE2 = {
  width: "380px",
  height: "42px",
  margin: "10px 30px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  color: "white",
  backgroundColor: "none",
  zIndex: "15",
}
const ICON_STYLE = {
  width: "100%",
  height: "100%",
  textAlign: "center",
  cursor: "pointer",
  zIndex: "15",
}

const NAVBAR = {
  position: "sticky",
  height: "42px",
  margin: "10px 30px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: "100",
}
const MIDTITLE = {
  margin: "0 auto",
  padding: "0",
  display: "flex",
  alignItems: "center",
}
const MidTitle = styled(Typography)(
  ({
    theme: {
      textStyles: {
        title3: { bold },
      },
    },
  }) => ({
    fontSize: bold.fontSize,
    lineHeight: bold.lineHeight,
    fontWeight: bold.fontWeight,
    zIndex: "15",
  })
)

const CourseEditLayout = (): JSX.Element => {
  const navigate = useNavigate()
  const { id } = useParams<string>()
  const [page, setPage] = useState<number>(1)
  const onClickClose = (): void => {
    navigate("/")
  }

  const onClickPrev = (): void => {
    if (page !== 1) setPage(page - 1)
  }

  return (
    { id } && (
      <Box sx={{ width: "100%", typography: "body1" }}>
        <Box sx={{ borderColor: "divider", width: "100%" }}>
          <Box sx={page !== 4 ? NAVBAR : NAVBAR_STYLE2}>
            <Box sx={{ width: "24px", height: "24px", zIndex: "15" }}>
              <ArrowBackIosNewOutlined sx={ICON_STYLE} onClick={onClickPrev} />
            </Box>
            <Box sx={MIDTITLE}>
              <MidTitle
                sx={{
                  color: page !== 4 ? "black" : "white",
                }}
              >
                {page === 1
                  ? "코스수정"
                  : page === 2
                  ? "장소선택"
                  : page === 3
                  ? "장소등록"
                  : "미리보기"}
              </MidTitle>
            </Box>
            <Box sx={{ width: "24px", height: "24px", zIndex: "15" }}>
              <Close fontSize="medium" sx={ICON_STYLE} onClick={onClickClose} />
            </Box>
          </Box>
          {page !== 4 && (
            <LinearProgress
              sx={{ zIndex: "16" }}
              variant="determinate"
              value={33.3 * page}
            />
          )}
        </Box>
        {page === 1 && (
          <CourseEditDetail1 page={1} setPage={setPage} id={Number(id)} />
        )}

        {page === 2 && (
          <CourseEditDetail2 page={2} setPage={setPage} id={Number(id)} />
        )}
        {page === 3 && (
          <SearchPlace
            mode={PlaceType.c}
            editMode={false}
            id={Number(id)}
            page={3}
            setPage={setPage}
          />
        )}
        {page === 4 && (
          <CourseEditDetail3 page={4} setPage={setPage} id={Number(id)} />
        )}
      </Box>
    )
  )
}

export default CourseEditLayout
