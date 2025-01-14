from opentrons_shared_data.errors.exceptions import GeneralError


class ExceptionInProtocolError(GeneralError):
    """This exception wraps an exception that was raised from a protocol
    for proper error message formatting by the rpc, since it's only here that
    we can properly figure out formatting
    """

    def __init__(self, original_exc, original_tb, message, line):
        self.original_exc = original_exc
        self.original_tb = original_tb
        self.message = message
        self.line = line
        super().__init__(
            wrapping=[original_exc],
            message="{}{}: {}".format(
                self.original_exc.__class__.__name__,
                " [line {}]".format(self.line) if self.line else "",
                self.message,
            ),
        )

    def __str__(self):
        return self.message
