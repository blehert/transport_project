//  Импорты библиотек
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { MaterialReactTable } from 'material-react-table';
import { ExportToCsv } from 'export-to-csv-fix-source-map';
import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';


const BASE_TS_URL = 'http://192.168.45.76:5000/base_ts_data'

const TsTablePage = () => {

  const [data, setData] = useState([]);

  const fetchRouteData = useCallback(async () => {
    try {
      const res = await axios.get(BASE_TS_URL);
      const responseData = res.data
      // создаю новый объект дата, и добавляю в него поле park
      const newData = responseData.map((item) => {
        return { ...item, park: item['garage_number'][0] }
      })
      setData(newData);
    } catch (error) {
      console.error(error);
    }
  }, [])

  useEffect(() => {
    fetchRouteData();
  }, [fetchRouteData]);


  const columns = useMemo(
    () => [
      {
        header: 'Парк',
        accessorKey: 'park',
      },
      {
        header: 'Гаражный номер',
        accessorKey: 'garage_number',
      },
      {
        header: 'Гос. номер',
        accessorKey: 'gos_number',
      },
      {
        header: 'Модификация',
        accessorKey: 'modification',
      },
      {
        header: 'Год выпуска',
        accessorKey: 'year_release',
      },
      {
        header: 'Класс',
        accessorKey: 'class',
      },
      {
        header: 'Вендор',
        accessorKey: 'vendor',
      },
      {
        header: 'Модификация SEKOP',
        accessorKey: 'modification_SEKOP',
      },
      {
        header: 'Валидатор с бт',
        accessorKey: 'validator_with_bt',
      },
      {
        header: 'Валидатор без бт',
        accessorKey: 'validator_without_bt',
      },
    ],
    [],
  );

  const csvOptions = {
    fieldSeparator: ';',
    quoteStrings: '"',
    decimalSeparator: '.',
    showLabels: true,
    useBom: true,
    headers: columns.map((c) => c.header),
  };

  const csvExporter = new ExportToCsv(csvOptions);

  const handleExportRows = (rows) => {
    csvExporter.generateCsv(rows.map((row) => row.original));
  };

  const handleExportData = () => {
    csvExporter.generateCsv(data);
  };

  return (
    <div className="table-page">
      <h1 className='table-title'>Таблица</h1>
      <div className="table-wrapper">
        <MaterialReactTable
          columns={columns}
          data={data}
          enableRowSelection
          enableColumnOrdering
          enableGlobalFilter={false}
          enableStickyHeader
          renderTopToolbarCustomActions={({ table }) => (
            <Box
              sx={{ display: 'flex', gap: '1rem', p: '0.5rem', flexWrap: 'wrap' }}
            >
              <Button
                color="primary"
                //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
                onClick={handleExportData}
                startIcon={<FileDownloadIcon />}
                variant="contained"
              >
                Export All Data
              </Button>
              <Button
                disabled={table.getPrePaginationRowModel().rows.length === 0}
                //export all rows, including from the next page, (still respects filtering and sorting)
                onClick={() =>
                  handleExportRows(table.getPrePaginationRowModel().rows)
                }
                startIcon={<FileDownloadIcon />}
                variant="contained"
              >
                Export All Rows
              </Button>
              <Button
                disabled={table.getRowModel().rows.length === 0}
                //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
                onClick={() => handleExportRows(table.getRowModel().rows)}
                startIcon={<FileDownloadIcon />}
                variant="contained"
              >
                Export Page Rows
              </Button>
              <Button
                disabled={
                  !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
                }
                //only export selected rows
                onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
                startIcon={<FileDownloadIcon />}
                variant="contained"
              >
                Export Selected Rows
              </Button>
            </Box>
          )}
        />
      </div>
    </div>
  );
};

export default TsTablePage;
