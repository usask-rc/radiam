import {
    downloadCSV,
    useDataProvider,
    useNotify,
} from 'react-admin';
import jsonExport from 'jsonexport/dist';

const RadiamExportButton = ({ sort, filter, maxResults = 1000, resource }) => {
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const payload = { sort, filter, pagination: { page: 1, perPage: maxResults }}
    const handleClick = dataProvider.getList(resource, payload)
        .then(({ data }) => jsonExport(data, (err, csv) => downloadCSV(csv, resource)))
        .catch(error => notify('ra.notification.http_error', 'warning'));

    return (
        <Button
            label="Export"
            onClick={handleClick}
        />
    );
};