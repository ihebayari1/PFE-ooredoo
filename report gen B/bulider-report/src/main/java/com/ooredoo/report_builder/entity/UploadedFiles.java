package com.ooredoo.report_builder.entity;

import com.ooredoo.report_builder.common.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class UploadedFiles extends BaseEntity {

    private String originalFileName;
    private String storedFileName;
    private String fileType;
    private Integer fileSize;
    private String filePath;

    @ManyToOne
    @JoinColumn(name = "submission_value_id")
    private SubmissionValue submissionValue;

    public UploadedFiles(String originalFileName, String storedFileName, String fileType, Integer fileSize, String filePath, SubmissionValue submissionValue) {
        this.originalFileName = originalFileName;
        this.storedFileName = storedFileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.filePath = filePath;
        this.submissionValue = submissionValue;
    }

    public UploadedFiles() {
    }

    protected UploadedFiles(UploadedFilesBuilder<?, ?> b) {
        super(b);
        this.originalFileName = b.originalFileName;
        this.storedFileName = b.storedFileName;
        this.fileType = b.fileType;
        this.fileSize = b.fileSize;
        this.filePath = b.filePath;
        this.submissionValue = b.submissionValue;
    }

    public static UploadedFilesBuilder<?, ?> builder() {
        return new UploadedFilesBuilderImpl();
    }

    public String getOriginalFileName() {
        return this.originalFileName;
    }

    public String getStoredFileName() {
        return this.storedFileName;
    }

    public String getFileType() {
        return this.fileType;
    }

    public Integer getFileSize() {
        return this.fileSize;
    }

    public String getFilePath() {
        return this.filePath;
    }

    public SubmissionValue getSubmissionValue() {
        return this.submissionValue;
    }

    public void setOriginalFileName(String originalFileName) {
        this.originalFileName = originalFileName;
    }

    public void setStoredFileName(String storedFileName) {
        this.storedFileName = storedFileName;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public void setFileSize(Integer fileSize) {
        this.fileSize = fileSize;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public void setSubmissionValue(SubmissionValue submissionValue) {
        this.submissionValue = submissionValue;
    }

    public static abstract class UploadedFilesBuilder<C extends UploadedFiles, B extends UploadedFilesBuilder<C, B>> extends BaseEntityBuilder<C, B> {
        private String originalFileName;
        private String storedFileName;
        private String fileType;
        private Integer fileSize;
        private String filePath;
        private SubmissionValue submissionValue;

        public B originalFileName(String originalFileName) {
            this.originalFileName = originalFileName;
            return self();
        }

        public B storedFileName(String storedFileName) {
            this.storedFileName = storedFileName;
            return self();
        }

        public B fileType(String fileType) {
            this.fileType = fileType;
            return self();
        }

        public B fileSize(Integer fileSize) {
            this.fileSize = fileSize;
            return self();
        }

        public B filePath(String filePath) {
            this.filePath = filePath;
            return self();
        }

        public B submissionValue(SubmissionValue submissionValue) {
            this.submissionValue = submissionValue;
            return self();
        }

        protected abstract B self();

        public abstract C build();

        public String toString() {
            return "UploadedFiles.UploadedFilesBuilder(super=" + super.toString() + ", originalFileName=" + this.originalFileName + ", storedFileName=" + this.storedFileName + ", fileType=" + this.fileType + ", fileSize=" + this.fileSize + ", filePath=" + this.filePath + ", submissionValue=" + this.submissionValue + ")";
        }
    }

    private static final class UploadedFilesBuilderImpl extends UploadedFilesBuilder<UploadedFiles, UploadedFilesBuilderImpl> {
        private UploadedFilesBuilderImpl() {
        }

        protected UploadedFilesBuilderImpl self() {
            return this;
        }

        public UploadedFiles build() {
            return new UploadedFiles(this);
        }
    }
}
