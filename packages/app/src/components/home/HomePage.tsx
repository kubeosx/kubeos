import { Header, Page } from '@backstage/core-components';
import React from 'react';
import {
  SearchBar,
  SearchFilter,
  SearchResult,
  SearchPagination,
  useSearch,
} from '@backstage/plugin-search-react';

export const homePage = (
  <Page themeId="home">
  <Header title="Search" />

      <SearchBar />

  </Page>
);