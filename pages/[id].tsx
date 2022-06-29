import * as React from "react";

import {
  getAllKanji,
  getGraphData,
  getKanjiDataLocal,
  getStrokeAnimation,
} from "../lib/lib";

import type { GetStaticPaths, GetStaticProps } from "next";

import Graphs from "../components/graphs";

import Search from "../components/search";
import DrawInput from "../components/drawInput";
import Header from "../components/header";
import styled from "@emotion/styled";
import Examples from "../components/examples";
import Radical from "../components/radical";
import Kanji from "../components/kanji";

import useMediaQuery from "@mui/material/useMediaQuery";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SearchIcon from "@mui/icons-material/Search";
import SwipeableViews from "react-swipeable-views";
import { useRouter } from "next/router";

import { NextSeo } from "next-seo";

type KanjiInfo = {
  id: string;
  kanjialiveData?: any;
  jishoData?: any;
};

interface Props {
  kanjiInfo: KanjiInfo;
  graphData: any;
  strokeAnimation: string;
}

const Page: React.FC<Props> = ({ kanjiInfo, graphData, strokeAnimation }) => {
  const mobile = useMediaQuery("(max-width: 767px)");
  const desktop = useMediaQuery("(min-width: 768px)");

  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChangeIndex = (index: number) => {
    setTabValue(index);
  };

  const router = useRouter();
  React.useEffect(() => {
    const resetTab = () => setTabValue(0);
    router.events.on("routeChangeComplete", resetTab);
    return () => {
      router.events.off("routeChangeComplete", resetTab);
    };
  }, [router.events]);

  return (
    <>
      <NextSeo
        title={`${kanjiInfo.id} | The Kanji Map`}
        description={`Kanji information for ${kanjiInfo.id}`}
      />
      <Wrapper>
        <Header />
        <Main>
          {desktop && (
            <>
              <Top>
                <SearchWrapper>
                  <Search />
                  <DrawInput />
                </SearchWrapper>
                <Kanji {...{ kanjiInfo, graphData, strokeAnimation }} />
                <Radical kanjiInfo={kanjiInfo} />
              </Top>
              <Bottom>
                <Examples kanjiInfo={kanjiInfo} />
                <Graphs {...{ kanjiInfo, graphData }} />
              </Bottom>
            </>
          )}
          {mobile && (
            <>
              <SwipeableViews
                axis={"x"}
                index={tabValue}
                onChangeIndex={handleChangeIndex}
              >
                <TabPanel value={tabValue} index={0}>
                  <Kanji {...{ kanjiInfo, graphData, strokeAnimation }} />
                </TabPanel>
                <TabPanel value={tabValue} index={1}>
                  <Examples kanjiInfo={kanjiInfo} />
                </TabPanel>
                <TabPanel value={tabValue} index={2}>
                  <Radical kanjiInfo={kanjiInfo} />
                </TabPanel>
                <TabPanel value={tabValue} index={3}>
                  <Graphs {...{ kanjiInfo, graphData }} />
                </TabPanel>
                <TabPanel value={tabValue} index={4}>
                  <SearchWrapper>
                    <Search />
                    <DrawInput />
                  </SearchWrapper>
                </TabPanel>
              </SwipeableViews>
            </>
          )}
        </Main>
        {mobile && (
          <Controls>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="secondary"
              textColor="inherit"
              variant="fullWidth"
              aria-label="full width tabs example"
            >
              <Tab label="漢字" />
              <Tab label="例" />
              <Tab label="部首" />
              <Tab label="図" />
              <Tab icon={<SearchIcon />} />
            </Tabs>
          </Controls>
        )}
      </Wrapper>
    </>
  );
};

export default Page;

interface TabPanelProps {
  children?: React.ReactNode;
  dir?: string;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <TabPanelWrapper
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <>{children}</>}
    </TabPanelWrapper>
  );
};
const TabPanelWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

// *  Next.js

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllKanji();
  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const kanjiInfoRaw = await getKanjiDataLocal(params?.id as string);
  const graphDataRaw = await getGraphData(params?.id as string);
  const strokeAnimation = await getStrokeAnimation(params?.id as string);
  // workaround to avoid "cannot serialize undefined" error
  const kanjiInfo = JSON.parse(JSON.stringify(kanjiInfoRaw));
  const graphData = JSON.parse(JSON.stringify(graphDataRaw));

  return {
    props: {
      kanjiInfo,
      graphData,
      strokeAnimation,
    },
  };
};

// *  Styles
const Wrapper = styled.div`
  position: relative;
  height: 100vh;
  height: -webkit-fill-available;
  height: -moz-fill-available;
  height: fill-available;
`;
const Main = styled.main`
  width: 100%;
  height: calc(100% - 50px);
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 330px 1fr;

  @media (max-width: 767px) {
    height: calc(100% - 100px);
    grid-template-rows: 1fr;
    & > div {
      position: relative;
      height: 100%;
      & > div {
        position: relative;
        height: 100%;
      }
    }
  }
`;

const Top = styled.div`
  display: grid;
  grid-template-columns: 252px 1fr 1fr;
  overflow: hidden;
  border-bottom: 1px solid var(--color-lighter);
`;

const Bottom = styled.div`
  display: grid;
  grid-template-columns: 2fr 3fr;
  overflow: hidden;
`;

const SearchWrapper = styled.div`
  position: relative;
  padding: 16px;

  & > div:first-of-type {
    margin-bottom: 10px;
  }
`;

// * Mobile
const Controls = styled.div`
  border-top: 1px solid var(--color-lighter);
  border-bottom: 1px solid var(--color-lighter);
  height: 50px;

  & .Mui-selected {
    color: var(--color-primary) !important;
  }
  & .MuiTabs-indicator {
    background-color: var(--color-primary) !important;
  }

  button {
    min-width: 50px;
  }

  @media (max-width: 767px) {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50px;
  }
`;
