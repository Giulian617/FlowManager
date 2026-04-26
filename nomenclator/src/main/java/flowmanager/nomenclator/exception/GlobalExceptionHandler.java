package flowmanager.nomenclator.exception;

import tools.jackson.databind.exc.InvalidFormatException;
import flowmanager.nomenclator.dto.ErrorResponseDto;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorResponseDto handleNotFoundException(NotFoundException ex) {
        return new ErrorResponseDto(ex.getMessage());
    }

    @ExceptionHandler(DuplicateAttributeException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ErrorResponseDto handleDuplicateAttributeException(DuplicateAttributeException ex) {
        return new ErrorResponseDto(ex.getMessage());
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponseDto handleMalformedJson(HttpMessageNotReadableException ex) {
        System.out.println("CAUSE: " + ex.getCause());
        System.out.println("CAUSE CLASS: " + ex.getCause().getClass().getName());

        if (ex.getCause() instanceof InvalidFormatException invalidFormatException
                && invalidFormatException.getTargetType().isEnum()) {

            String fieldName = invalidFormatException.getPath().get(0).getPropertyName();
            System.out.println("FIELD NAME: " + fieldName);

            if ("type".equals(fieldName)) {
                return new ErrorResponseDto(
                        "Accepted values for type: Task, Bug, Epic, User_Story"
                );
            }

            if ("status".equals(fieldName)) {
                return new ErrorResponseDto(
                        "Accepted values for status: To_do, In_Progress, Testing, Done, Closed"
                );
            }

            if ("severity".equals(fieldName)) {
                return new ErrorResponseDto(
                        "Accepted values for severity: Low, Medium, High, Critical, Blocker"
                );
            }

            return new ErrorResponseDto("Invalid value for field " + fieldName);
        }

        return new ErrorResponseDto("Malformed JSON request");
    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponseDto handleValidation(MethodArgumentNotValidException ex) {
        String defaultMessage = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(DefaultMessageSourceResolvable::getDefaultMessage)
                .orElse("Invalid request data");

        return new ErrorResponseDto(defaultMessage);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorResponseDto handleIllegalArgument(IllegalArgumentException ex) {
        return new ErrorResponseDto(ex.getMessage());
    }

}