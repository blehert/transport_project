//  Импорты библиотек
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { MaterialReactTable } from 'material-react-table';
import { ExportToCsv } from 'export-to-csv-fix-source-map';
import { Box, Button } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';


const BASE_TH_URL = 'https://192.168.45.76:5000/base_th_data'

const ThTablePage = () => {

    const [data, setData] = useState([]);

    const fetchRouteData = useCallback(async () => {
        try {
            const res = await axios.get(BASE_TH_URL);
            console.log(res)
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
                header: 'VIN №',
                accessorKey: 'vin',
            },
            {
                header: 'Марка, модель тахографа',
                accessorKey: 'brand_model_tachograph',
            },
            {
                header: 'Дата поверки тахографа',
                accessorKey: 'date_verification_tachograph',
            },
            {
                header: 'Тахограф №',
                accessorKey: 'tachograph_numb',
            },
            {
                header: 'НКМ, СКЗИ №',
                accessorKey: 'nkm_skzi_numb',
            },
            {
                header: 'Дата окончания НКМ',
                accessorKey: 'ncm_end_date',
            },
            {
                header: 'Дата  калибровки',
                accessorKey: 'date_calibration',
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
        // useKeysAsHeaders: true,
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

export default ThTablePage;
