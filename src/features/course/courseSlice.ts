/* eslint-disable import/prefer-default-export */
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { CourseData } from "types/API/course-service"
import { api } from "features/api/apiSlice"
import { Server, ServerResponse } from "http"
import { createSlice } from "@reduxjs/toolkit"
import type { PayloadAction } from "@reduxjs/toolkit"
import type { RootState } from "../../app/store"

interface CourseId {
  courseId: number
}
interface CourseIdResponse extends ServerResponse {
  data: CourseId
}

interface CoursePlaceState {
  courseDetails: {
    title: string
    description: string
    imgFile: string
  }
  coursePlaces: [
    {
      order: number
      name: string
      description: string
      lng: number // 경도 x
      lat: number // 위도 y
      kakaoPlaceId: number
      placeCategory: string
    }
  ]
}

interface CoursePlaceProps {
  order: number
  name: string
  description: string
  lng: number // 경도 x
  lat: number // 위도 y
  kakaoPlaceId: number
  placeCategory: string
}

interface CourseDetailProps {
  title: string
  description: string
  imgFile: string
}

const initialState: CoursePlaceState = {
  courseDetails: {
    title: "undefined",
    description: "",
    imgFile: "",
  },
  coursePlaces: [
    {
      order: 0,
      name: "newName",
      description: "값을 입력해 주세요",
      lng: 38.05248142233915, // 경도 x
      lat: 127.65930674808553, // 위도 y
      kakaoPlaceId: 12346,
      placeCategory: "ETC",
    },
  ],
}

// 전체에 적용될 order값 설정

export const coursePlaceSlice = createSlice({
  name: "coursePlace",
  initialState,
  reducers: {
    addCoursePlace: (state, action: PayloadAction<CoursePlaceProps>): any => {
      if (state.coursePlaces[0].order === 0) {
        state.coursePlaces[0] = { ...action.payload, order: 1 }
      } else {
        state.coursePlaces.push({
          ...action.payload,
          order: state.coursePlaces.length + 1,
        })
      }
    },
    setCourseDetail: (state, action: PayloadAction<CourseDetailProps>): any => {
      if (state.courseDetails.title === "undefined") {
        state.courseDetails.title = action.payload.title
        state.courseDetails.description = action.payload.description
        state.courseDetails.imgFile = action.payload.imgFile
      }
    },
  },
})

export const { addCoursePlace, setCourseDetail } = coursePlaceSlice.actions
export default coursePlaceSlice.reducer
// 사실은 서비스 느낌

export const courseApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCourseList: builder.query<ServerResponse, void>({
      query: () => ({
        url: "/courses",
      }),
    }),
    addCourseDetail: builder.mutation<CourseIdResponse, FormData>({
      query: (data) => ({
        url: "/courses",
        method: "POST",
        body: data,
      }),
    }),
    addCoursePlace: builder.mutation<ServerResponse, any>({
      query: (data) => ({
        url: `/courses/${data.courseId}/course-places/batch`,
        method: "POST",
        body: data.postData,
      }),
      transformResponse: (response: any, meta, args): any => {
        console.log(
          "courseId : %d courseStatus : %s",
          response.data.courseId,
          response.data.courseStatus
        )
        return response.data.courseId
      },
    }),
  }),
})

export const {
  useGetCourseListQuery,
  useAddCourseDetailMutation,
  useAddCoursePlaceMutation,
} = courseApi
