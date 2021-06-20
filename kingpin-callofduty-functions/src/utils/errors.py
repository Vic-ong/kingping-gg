import traceback

Internal = { 'status': 500, 'id': 'INTERNAL' }
ParamsMissing = { 'status': 400, 'id': 'PARAMS_MISSING' } 

class Error:
    @staticmethod
    def createResponse(status, error_id, message):
        return (
            status,
            {
                '_id': error_id,
                'message': message,
            }
        )

    @staticmethod
    def internalError(errors: str):
        print('[START error messages]')
        print(errors)
        traceback.print_tb(errors.__traceback__)
        print('[END error messages]')

        return Error.createResponse(
            Internal['status'],
            Internal['id'],
            'Internal server error'
        )

    @staticmethod
    def missingParams(params: [str]):
        return Error.createResponse(
            ParamsMissing['status'],
            ParamsMissing['id'],
            ', '.join(params)
        )
