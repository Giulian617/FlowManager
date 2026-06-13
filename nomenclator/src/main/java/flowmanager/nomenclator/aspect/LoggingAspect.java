package flowmanager.nomenclator.aspect;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 *  - Every controller request  — (INFO) — method + args
 *  - Every service call        — (DEBUG) — method + args + return value + elapsed ms
 *  - Every exception           — (ERROR) — full stack trace
 */
@Aspect
@Component
public class LoggingAspect {

    @Pointcut("within(flowmanager.nomenclator.controller..*)")
    public void controllerLayer() {}

    @Pointcut("within(flowmanager.nomenclator.service..*)")
    public void serviceLayer() {}

    @Around("controllerLayer()")
    public Object logControllerCall(ProceedingJoinPoint pjp) throws Throwable {
        Logger log = loggerFor(pjp);
        String className  = pjp.getTarget().getClass().getSimpleName();
        String methodName = pjp.getSignature().getName();

        log.info("→ {}.{}() called with args: {}",
                className, methodName,
                Arrays.toString(pjp.getArgs()));

        try {
            Object result = pjp.proceed();
            log.info("← {}.{}() returned: {}", className, methodName, result);
            return result;
        } catch (Throwable ex) {
            log.error("✖ Exception in {}.{}() with args {}: {}",
                    className, methodName,
                    Arrays.toString(pjp.getArgs()),
                    ex.getMessage(),
                    ex);
            throw ex;  // rethrow so the user still gets the error response
        }
    }

    @Around("serviceLayer()")
    public Object logServiceCall(ProceedingJoinPoint pjp) throws Throwable {
        Logger log = loggerFor(pjp);
        String className  = pjp.getTarget().getClass().getSimpleName();
        String methodName = pjp.getSignature().getName();

        log.debug("→ {}.{}() args: {}", className, methodName,
                Arrays.toString(pjp.getArgs()));

        long start = System.currentTimeMillis();
        Object result = pjp.proceed();
        long elapsed = System.currentTimeMillis() - start;

        log.debug("← {}.{}() returned: {} [{}ms]", className, methodName,
                result, elapsed);

        return result;
    }

    private Logger loggerFor(JoinPoint jp) {
        return LoggerFactory.getLogger(jp.getTarget().getClass());
    }
}